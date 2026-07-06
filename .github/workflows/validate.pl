#!/usr/bin/env perl
use strict;
use warnings;
use File::Find;

print "=== CodeSplash Project Validation (Perl) ===\n";

my @required_files = (
    'package.json',
    'next.config.ts',
    'app/layout.tsx',
    'app/page.tsx',
    'tailwind.config.ts',
);

print "\n[1] Checking required files...\n";
my $missing = 0;
for my $file (@required_files) {
    if (-e $file) {
        print "  OK: $file\n";
    } else {
        print "  MISSING: $file\n";
        $missing++;
    }
}

print "\n[2] Checking package.json for dependencies...\n";
if (-e 'package.json') {
    open my $fh, '<', 'package.json' or die "Cannot open package.json: $!";
    my $content = do { local $/; <$fh> };
    close $fh;

    for my $dep (qw(next react react-dom tailwindcss)) {
        if ($content =~ /"$dep"/) {
            print "  FOUND: $dep\n";
        } else {
            print "  NOT FOUND: $dep\n";
        }
    }
}

print "\n[3] Checking for .env file...\n";
if (-e '.env' || -e '.env.local') {
    print "  WARNING: Environment file detected. Ensure it is gitignored.\n";
} else {
    print "  OK: No environment file found in repo root.\n";
}

print "\n[4] Counting source files...\n";
my ($tsx_count, $ts_count, $js_count) = (0, 0, 0);
find(sub {
    return unless -f;
    $tsx_count++ if /\.tsx$/;
    $ts_count++  if /\.ts$/ && !/\.tsx$/;
    $js_count++  if /\.js$/;
}, 'app', 'components', 'lib');

print "  .tsx files: $tsx_count\n";
print "  .ts files:  $ts_count\n";
print "  .js files:  $js_count\n";

print "\n[5] Checking for sensitive data patterns...\n";
my @sensitive_patterns = (
    qr/sk_live/,
    qr/AKIA[0-9A-Z]{16}/,
    qr/password\s*=\s*["'][^"']+["']/i,
);

my $sensitive_found = 0;
find(sub {
    return unless -f && /\.(ts|tsx|js|json)$/;
    return if /node_modules/;
    open my $fh, '<', $_ or return;
    my $line_num = 0;
    while (<$fh>) {
        $line_num++;
        for my $pattern (@sensitive_patterns) {
            if (/$pattern/) {
                print "  WARNING: Potential secret at $File::Find::name:$line_num\n";
                $sensitive_found++;
            }
        }
    }
    close $fh;
}, 'app', 'components', 'lib');

if ($sensitive_found == 0) {
    print "  OK: No obvious secrets found.\n";
}

print "\n=== Validation Complete ===\n";

if ($missing > 0) {
    print "RESULT: FAILED ($missing required files missing)\n";
    exit 1;
} else {
    print "RESULT: PASSED\n";
    exit 0;
}
