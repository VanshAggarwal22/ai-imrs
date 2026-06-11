const SHEET_ID = "1T0y1ovU55n8DL1f4hJWq2Zt-nxl1wWxeHcHZJExt0wc";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const action = data.action; 
    
    if (action === 'sync_all') {
      Object.keys(data.payload).forEach(key => {
        let sheet = ss.getSheetByName(key);
        if (!sheet) {
          sheet = ss.insertSheet(key);
        }
        sheet.clear();
        
        let items = data.payload[key];
        if (items && items.length > 0) {
          let headers = Object.keys(items[0]);
          sheet.appendRow(headers);
          
          let rows = items.map(item => headers.map(h => {
             let val = item[h];
             return typeof val === 'object' ? JSON.stringify(val) : val;
          }));
          sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
        }
      });
      return ContentService.createTextOutput(JSON.stringify({success: true})).setMimeType(ContentService.MimeType.JSON);
    }
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: err.message})).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let result = {};
    const sheets = ['inventoryItems', 'suppliersList', 'vendors', 'allLeads'];
    
    sheets.forEach(key => {
      let sheet = ss.getSheetByName(key);
      if (sheet) {
        let data = sheet.getDataRange().getValues();
        if (data.length > 1) {
          let headers = data[0];
          let items = [];
          for (let i = 1; i < data.length; i++) {
            let row = data[i];
            let obj = {};
            headers.forEach((h, index) => {
              let val = row[index];
              try {
                if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
                  val = JSON.parse(val);
                }
              } catch(e){}
              obj[h] = val;
            });
            items.push(obj);
          }
          result[key] = items;
        } else {
          result[key] = [];
        }
      }
    });
    return ContentService.createTextOutput(JSON.stringify({success: true, data: result}))
        .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: err.message}))
        .setMimeType(ContentService.MimeType.JSON);
  }
}
