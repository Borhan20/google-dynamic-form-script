function populateForm() {
    // Open the Google Form by ID
    var form = FormApp.openById('1TUGLRbglsVXUY6qnlxvhCw8SZo5T5HoYGwezPNzOEk0'); // Replace with your form ID
    
    // Open the Google Sheet by ID
    var sheet = SpreadsheetApp.openById('1aoxGl8I2rVfioJO80qqKxCuHCKcXy2CATs-5Btgc1zQ').getSheetByName('Sheet1'); // Replace with your Sheet ID and sheet name
    
    // Get all data from the sheet
    var data = sheet.getDataRange().getValues();
    
    // Create structures to hold unique options
    var regionOptions = new Set();
    var zillaOptions = {};
    var upazilaOptions = {};
    
    // Populate the structures based on the hierarchy
    data.forEach(function(row, index) {
      if (index === 0) return; // Skip the header row
      
      var region = row[0];
      var zilla = row[1];
      var upazila = row[2];
      
      regionOptions.add(region);
      
      // Initialize zilla options
      if (!zillaOptions[region]) {
        zillaOptions[region] = new Set();
      }
      zillaOptions[region].add(zilla);
      
      // Initialize upazila options
      if (!upazilaOptions[zilla]) {
        upazilaOptions[zilla] = new Set();
      }
      upazilaOptions[zilla].add(upazila);
    });
    
    // Clear existing items from the form to avoid duplicates
    form.getItems().forEach(function(item) {
      form.deleteItem(item);
    });
    
    // Create first section for name and phone number
    form.addSectionHeaderItem().setTitle('Contact Information');
    form.addTextItem().setTitle('Name').setRequired(true);
    form.addTextItem().setTitle('Phone Number').setRequired(true);
    
    // Create the region multiple choice question
    var regionQuestion = form.addMultipleChoiceItem().setTitle('Select Region:');
    var regionsArray = Array.from(regionOptions);
    regionQuestion.setChoices(regionsArray.map(region => regionQuestion.createChoice(region, false)));
    
    // Create the Zilla section
    regionsArray.forEach(region => {
      var zillaSection = form.addPageBreakItem().setTitle('Zilla Selection for ' + region);
      var zillaQuestion = form.addMultipleChoiceItem().setTitle('Select Zilla:');
      zillaQuestion.setChoices(Array.from(zillaOptions[region]).map(zilla => zillaQuestion.createChoice(zilla, false)));
      
      // Create the Upazila section for each zilla
      Array.from(zillaOptions[region]).forEach(zilla => {
        var upazilaSection = form.addPageBreakItem().setTitle('Upazila Selection for ' + zilla);
        var upazilaQuestion = form.addMultipleChoiceItem().setTitle('Select Upazila:');
        upazilaQuestion.setChoices(Array.from(upazilaOptions[zilla]).map(upazila => upazilaQuestion.createChoice(upazila, false)));
      });
    });
  }
  