import React, { useState } from "react";
import RenderIf from "../common/RenderIf";
import { tailStrings } from "../constants/landingPage";
var XLSX = require("xlsx");

const LandingPage = () => {
  const [transactions, setTransactions] = useState({});
  const [selectedItem, setSelectedItem] = useState(-1);

  var ExcelToJSON = function () {
    this.parseExcel = function (file) {
      if (file) {
        var reader = new FileReader();

        reader.onload = function (e) {
          var data = e.target.result;
          var workbook = XLSX.read(data, {
            type: "binary",
          });

          const sheetData = workbook.SheetNames.map(function (sheetName) {
            var XL_row_object = XLSX.utils.sheet_to_row_object_array(
              workbook.Sheets[sheetName]
            );
            var json_object = JSON.stringify(XL_row_object);
            return JSON.parse(json_object);
          })[0];

          const result = {};

          sheetData.forEach((transactionDetails) => {
            let key = transactionDetails.Narration;
            tailStrings.forEach((str) => {
              var re = new RegExp(`\\d+-${str}`, "g");
              key = key.replace(re, str);
            });
            if (result.hasOwnProperty(key)) {
              result[key]["data"].push(transactionDetails);
              Object.keys(transactionDetails).forEach((transactionDetail) => {
                result[key]["headers"][transactionDetail] = "";
              });
            } else {
              result[key] = {};
              result[key]["data"] = [transactionDetails];
              result[key]["headers"] = {};
              Object.keys(transactionDetails).forEach((transactionDetail) => {
                result[key]["headers"][transactionDetail] = "";
              });
            }
          });

          if (JSON.stringify(result) !== JSON.stringify(transactions)) {
            setTransactions(result);
          }
        };

        reader.onerror = function (ex) {
          console.log(ex);
        };

        reader.readAsBinaryString(file);
      } else {
        setTransactions({});
      }
    };
  };

  function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object
    var xl2json = new ExcelToJSON();
    xl2json.parseExcel(files[0]);
  }

  return (
    <div className="d-flex flex-column justify-content-center w-50 m-auto text-center">
      <h2 className="mt-4 text-decoration-underline">Spend Smart</h2>
      <div className="my-4">
        <label htmlFor="formFile" className="form-label">
          <h4>Upload Transactions Sheet (in xlsx format)</h4>
        </label>
        <input
          className="form-control"
          type="file"
          id="formFile"
          onChange={handleFileSelect}
        />
      </div>
      <RenderIf condition={Object.keys(transactions).length}>
        <h3 className="mb-2">Transaction Details</h3>
        <div className="accordion mb-5" id="accordionContainer">
          {Object.entries(transactions).map(
            ([transactionTo, transactionDetail], index) => {
              const finalDetails = {
                "Withdrawal Amt.": 0,
                "Deposit Amt.": 0,
                "Closing Balance": 0,
              };
              return (
                <div
                  className="accordion-item"
                  key={`heading-${transactionTo}`}
                  onClick={() => setSelectedItem(index + 1)}
                >
                  <h2
                    className="accordion-header"
                    id={`heading-${transactionTo}`}
                  >
                    <button
                      className={`accordion-button ${
                        selectedItem === index + 1 ? "" : "collapsed"
                      }`}
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target={`#collapse-${index + 1}`}
                      aria-expanded="true"
                      aria-controls={`collapse-${index + 1}`}
                    >
                      {transactionTo}
                    </button>
                  </h2>
                  <div
                    id={`collapse-${index + 1}`}
                    className={`accordion-collapse collapse ${
                      selectedItem === index + 1 ? "show" : ""
                    }`}
                    aria-labelledby={`heading-${transactionTo}`}
                    data-bs-parent="#accordionContainer"
                  >
                    <div className="accordion-body table-responsive text-nowrap">
                      <table className="table table-light table-striped table-hover">
                        <thead>
                          <tr>
                            {Object.keys(transactionDetail.headers).map(
                              (header) => (
                                <th scope="col" key={header}>
                                  {header}
                                </th>
                              )
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {transactionDetail.data.map((transactionData) => {
                            return (
                              <tr key={transactionData["Chq./Ref.No."]}>
                                {Object.keys(transactionDetail.headers).map(
                                  (header) => {
                                    if (header in finalDetails) {
                                      if (header === "Closing Balance") {
                                        finalDetails[header] =
                                          transactionData[header];
                                      } else {
                                        finalDetails[header] +=
                                          transactionData[header] || 0;
                                      }
                                    }
                                    return (
                                      <td
                                        key={`${transactionData["Chq./Ref.No."]}-${header}`}
                                      >
                                        {transactionData[header] || "-"}
                                      </td>
                                    );
                                  }
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      <div className="d-flex flex-column text-start">
                        {Object.entries(finalDetails).map(
                          ([detailKey, detail]) => (
                            <h6>
                              {detailKey}: {detail}
                            </h6>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </RenderIf>
    </div>
  );
};

export default LandingPage;
