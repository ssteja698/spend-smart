import React, { useEffect } from 'react';
const readXlsxFile = require('read-excel-file');

const LandingPage = () => {
  var ExcelToJSON = function() {

    this.parseExcel = function(file) {
      var reader = new FileReader();

      reader.onload = function(e) {
        var data = e.target.result;
        var workbook = XLSX.read(data, {
          type: 'binary'
        });

        const sheetData = workbook.SheetNames.map(function(sheetName) {
          // Here is your object
          var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
          var json_object = JSON.stringify(XL_row_object);
          return JSON.parse(json_object);
        })[0];

        const tailStrings = [
          "PAYMENT",
          "PAY",
          "IRCTC",
          "UPI",
          "WHATSAPP",
          "FEDERAL"
        ];

        const result = {};

        sheetData.map(item => { 
          key = item.Narration;
          tailStrings.forEach(str => {
            var re = new RegExp(`\\d+-${str}`, "g");
            key = key.replace(re, str);
          });
          if (result.hasOwnProperty(key)) {
            result[key].push(item);
          } else {
            result[key] = [item];
          }
        });
      };

      reader.onerror = function(ex) {
        console.log(ex);
      };

      reader.readAsBinaryString(file);
    };
  };

  function handleFileSelect(evt) {

    var files = evt.target.files; // FileList object
    var xl2json = new ExcelToJSON();
    xl2json.parseExcel(files[0]);
  }

  return (
    <div>Who are you</div>
  )
}

export default LandingPage