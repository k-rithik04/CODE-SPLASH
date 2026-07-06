#!/usr/bin/perl
use strict;
use warnings;
use File::Find;
use File::Path qw(make_path);

print "=========================================\n";
print "  CodeSplash - Vercel Config Validator\n";
print "=========================================\n\n";

my @checks;
my $pass = 0;
my $fail = 0;

sub check {
    my ($label, $condition) = @_;
    if ($condition) {
        print "  [PASS] $label\n";
        $pass++;
    } else {
        print "  [FAIL] $label\n";
        $fail++;
    }
}

print "[1] Checking vercel.json...\n";
check("vercel.json exists", -e "vercel.json");

if (-e "vercel.json") {
    open my $fh, '<', 'vercel.json' or die "Cannot read vercel.json: $!";
    my $content = do { local $/; <$fh> };
    close $fh;

    check("Has framework field", $content =~ /"framework"/);
    check("Has regions config", $content =~ /"regions"/);
    check("Has cache headers", $content =~ /"Cache-Control"/);
    check("No trailing slash rewrites", $content !~ /"trailingSlash"/);
}

print "\n[2] Checking next.config.ts for Vercel optimizations...\n";
if (-e "next.config.ts") {
    open my $fh, '<', 'next.config.ts' or die "Cannot read next.config.ts: $!";
    my $content = do { local $/; <$fh> };
    close $fh;

    check("Compression enabled", $content =~ /compress\s*:\s*true/);
    check("Image formats optimized", $content =~ /formats.*avif/);
    check("Package import optimization", $content =~ /optimizePackageImports/);
    check("poweredByHeader disabled", $content =~ /poweredByHeader\s*:\s*false/);
} else {
    check("next.config.ts exists", 0);
}

print "\n[3] Checking package.json scripts...\n";
if (-e "package.json") {
    open my $fh, '<', 'package.json' or die "Cannot read package.json: $!";
    my $content = do { local $/; <$fh> };
    close $fh;

    check("Has build:vercel script", $content =~ /"build:vercel"/);
    check("Has build:ghpages script", $content =~ /"build:ghpages"/);
    check("Has start script", $content =~ /"start"/);
} else {
    check("package.json exists", 0);
}

print "\n[4] Checking for environment files...\n";
my @env_files = ('.env', '.env.local', '.env.production');
my $env_found = 0;
for my $env (@env_files) {
    if (-e $env) {
        print "  [INFO] Found $env - ensure it is in .gitignore\n";
        $env_found = 1;
    }
}
check("No unignored env files", !$env_found);

print "\n[5] Checking .gitignore...\n";
if (-e ".gitignore") {
    open my $fh, '<', '.gitignore' or die "Cannot read .gitignore: $!";
    my $content = do { local $/; <$fh> };
    close $fh;

    check(".env is gitignored", $content =~ /\.env/);
    check("node_modules is gitignored", $content =~ /node_modules/);
    check(".next is gitignored", $content =~ /\.next/);
} else {
    check(".gitignore exists", 0);
}

print "\n=========================================\n";
print "Results: $pass passed, $fail failed\n";
print "=========================================\n";

if ($fail > 0) {
    print "RESULT: FIX ISSUES BEFORE DEPLOYING\n";
    exit 1;
} else {
    print "RESULT: READY FOR VERCEL DEPLOYMENT\n";
    exit 0;
}
