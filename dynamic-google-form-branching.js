function populateForm() {
    // Open the Google Form by ID
    var form = FormApp.openById('1VU0ptOw1EEt9ErE235dG8SMk04LUOYGxF6vAQt1g8zw'); // Replace with your form ID
    
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
    
    // Clear all existing items from the form
    var items = form.getItems();
    for (var i = items.length - 1; i >= 0; i--) {
        form.deleteItem(items[i]);
    }
    
    // Create the first section for name and phone number
    form.addSectionHeaderItem().setTitle('Contact Information');
    form.addTextItem().setTitle('Name').setRequired(true);
    form.addTextItem().setTitle('Phone Number').setRequired(true);
    
    // Create the region multiple choice question
    var regionQuestion = form.addMultipleChoiceItem().setTitle('Select Region:').setRequired(true);
    var regionsArray = Array.from(regionOptions);
    var regionPageBreaks = {};
    
    // Store Zilla Page Breaks to link them to Upazila sections
    var zillaPageBreaks = {};
    
    // Iterate through regions and set up the corresponding Zilla sections
    regionsArray.forEach(function(region) {
        // Create a page break after selecting the region
        var regionBreak = form.addPageBreakItem().setTitle('Zilla Selection for ' + region);
        regionPageBreaks[region] = regionBreak;
        
        // Create the Zilla selection question
        var zillaQuestion = form.addMultipleChoiceItem().setTitle('Select Zilla for ' + region).setRequired(true);
        var zillasArray = Array.from(zillaOptions[region]);
        
        // Create a Zilla page break and store it for linking to Upazila sections
        zillasArray.forEach(function(zilla) {
            var zillaBreak = form.addPageBreakItem().setTitle('Upazila Selection for ' + zilla);
            zillaPageBreaks[zilla] = zillaBreak;
            
            // Create the Upazila selection question linked to the Zilla
            var upazilaQuestion = form.addMultipleChoiceItem().setTitle('Select Upazila for ' + zilla).setRequired(true);
            upazilaQuestion.setChoices(Array.from(upazilaOptions[zilla]).map(upazila => upazilaQuestion.createChoice(upazila)));
        });
        
        // Link Zilla question choices to the appropriate Upazila section
        zillaQuestion.setChoices(zillasArray.map(function(zilla) {
            return zillaQuestion.createChoice(zilla, zillaPageBreaks[zilla]);
        }));
    });
    
    // Set up region question to navigate to the corresponding Zilla section
    regionQuestion.setChoices(regionsArray.map(function(region) {
        return regionQuestion.createChoice(region, regionPageBreaks[region]);
    }));
    
    // Add a submit section after the last Upazila question
    form.addPageBreakItem().setTitle('Review and Submit');
    form.addTextItem().setTitle('Any comments or feedback?');
}
