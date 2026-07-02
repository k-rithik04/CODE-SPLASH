

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.openById('1Vvy2gJzmCFnpBTF_TdKiKRupuHbDXACPuP4eQyELx8k').getActiveSheet();
    const p = e.parameter;

    const row = [
      new Date(),
      p.teamName || '',
      p.noOfMembers || '',
      p.school || '',
      p.schoolAddress || '',
      p.district || '',
      p.teacherName || '',
      p.teacherEmail || '',
      p.teacherPhone || '',
      p.leaderName || '',
      p.leaderGrade || '',
      p.leaderEmail || '',
      p.leaderPhone || '',
      p.member2Name || '',
      p.member2Grade || '',
      p.member2Phone || '',
      p.member3Name || '',
      p.member3Grade || '',
      p.member3Phone || '',
      p.member4Name || '',
      p.member4Grade || '',
      p.member4Phone || '',
      p.member5Name || '',
      p.member5Grade || '',
      p.member5Phone || '',
      p.declaration || '',
    ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'CodeSplash Webhook is running' }))
    .setMimeType(ContentService.MimeType.JSON);
}
