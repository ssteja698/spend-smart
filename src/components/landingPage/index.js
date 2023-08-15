import html2canvas from "html2canvas";
import React, { useEffect, useState } from "react";
import RenderIf from "../common/RenderIf";
import { tailStrings } from "../constants/landingPage";
import { ExcelDateToJSDate } from "../utils/helpers";
import "./styles.css";

var XLSX = require("xlsx");

const LandingPage = () => {
  const [transactionsInSheet, setTransactionsInSheet] = useState([]);
  const [selectedIdToTakeScreenshot, setSelectedIdToTakeScreenshot] =
    useState(null);
  const [transactions, setTransactions] = useState({});
  const [selectedItem, setSelectedItem] = useState(-1);

  const overallDetails = {
    "Withdrawal Amt.": 0,
    "Deposit Amt.": 0,
  };

  useEffect(() => {
    if (selectedIdToTakeScreenshot) {
      html2canvas(document.getElementById(selectedIdToTakeScreenshot)).then(
        (canvas) => {
          document
            .getElementById(`${selectedIdToTakeScreenshot}--screenshot`)
            .appendChild(canvas);

          let link = document.createElement("a");
          link.download = `${selectedIdToTakeScreenshot}.png`;
          link.href = document
            .getElementById(`${selectedIdToTakeScreenshot}--screenshot`)
            .childNodes[0].toDataURL();
          link.click();
        }
      );
    }
  }, [selectedIdToTakeScreenshot]);

  const ExcelToJSON = function () {
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

          if (transactionsInSheet.length === 0) {
            setTransactionsInSheet(sheetData);
          }

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
        <div className="accordion mb-3" id="accordionContainer">
          {Object.entries(transactions).map(
            ([transactionTo, transactionDetail], index) => {
              const finalDetails = {
                "Withdrawal Amt.": 0,
                "Deposit Amt.": 0,
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
                    <div
                      id={transactionTo}
                      className="accordion-body container"
                    >
                      <table className="table table-dark table-striped table-hover">
                        <thead>
                          <tr>
                            {Object.keys(transactionDetail.headers)
                              .filter((header) => header !== "Closing Balance")
                              .map((header) => (
                                <th scope="col" key={header}>
                                  {header}
                                </th>
                              ))}
                          </tr>
                        </thead>
                        <tbody>
                          {transactionDetail.data.map((transactionData) => {
                            const rowKey = `${transactionData.Date}--${transactionData.Narration}--${transactionData["Chq./Ref.No."]}--${transactionData["Withdrawal Amt."]}--${transactionData["Closing Balance"]}`;
                            return (
                              <tr key={rowKey}>
                                {Object.keys(transactionDetail.headers)
                                  .filter(
                                    (header) => header !== "Closing Balance"
                                  )
                                  .map((header) => {
                                    if (header in finalDetails) {
                                      if (header !== "Closing Balance") {
                                        finalDetails[header] +=
                                          Number(transactionData[header]) || 0;
                                        overallDetails[header] +=
                                          Number(transactionData[header]) || 0;
                                        finalDetails["Settlement to be done"] =
                                          finalDetails["Withdrawal Amt."] -
                                          finalDetails["Deposit Amt."];
                                      }
                                    }
                                    return (
                                      <td key={`${rowKey}--${header}`}>
                                        {header === "Date"
                                          ? ExcelDateToJSDate(
                                              transactionData[header]
                                            )
                                          : transactionData[header] || "-"}
                                      </td>
                                    );
                                  })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      <div className="d-flex flex-column text-start">
                        {Object.entries(finalDetails).map(
                          ([detailKey, detail]) => (
                            <h6 key={detailKey}>
                              {detailKey}:{" "}
                              <strong>
                                Rs. {detail.toLocaleString("en-IN")} /-
                              </strong>
                            </h6>
                          )
                        )}
                      </div>
                    </div>
                    <div className="d-flex px-3 pb-3">
                      <button
                        className="btn btn-primary"
                        onClick={() =>
                          setSelectedIdToTakeScreenshot(transactionTo)
                        }
                      >
                        Take Screenshot
                      </button>
                    </div>
                    <div className="screenshot-container border border-3 border-info">
                      <div id={`${transactionTo}--screenshot`}></div>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
        <div className="d-flex flex-column text-start mb-5">
          <>
            {Object.entries(overallDetails).map(([detailKey, detail]) => (
              <h6 key={detailKey}>
                {detailKey}: {detail}
              </h6>
            ))}
            <h6>
              Closing Balance:{" "}
              {transactionsInSheet[transactionsInSheet.length - 1]
                ? transactionsInSheet[transactionsInSheet.length - 1][
                    "Closing Balance"
                  ]
                : ""}
            </h6>
          </>
        </div>
      </RenderIf>
    </div>
  );
};

export default LandingPage;
