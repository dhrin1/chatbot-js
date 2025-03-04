document.addEventListener("DOMContentLoaded", function () {
  // Function to load external resources dynamically
  function loadResource(type, url) {
    return new Promise((resolve, reject) => {
      let element;
      if (type === "script") {
        element = document.createElement("script");
        element.src = url;
        element.onload = resolve;
        element.onerror = reject;
      } else if (type === "link") {
        element = document.createElement("link");
        element.rel = "stylesheet";
        element.href = url;
        element.onload = resolve;
        element.onerror = reject;
      }
      document.head.appendChild(element);
    });
  }

  // Load jQuery first, then CSS and Google Fonts
  loadResource("script", "/assets/js/jquery.min.js")
    .then(() => {
      console.log("jQuery loaded successfully");

      return Promise.all([
        loadResource("link", "/assets/css/style.css"),
        loadResource(
          "link",
          "https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
        ),
      ]);
    })
    .then(() => {
      console.log("CSS and Fonts loaded successfully");

      // Now that jQuery is loaded, proceed with chatbot creation

      // Create the chat button
      const chatBtn = document.createElement("button");
      chatBtn.id = "chat-btn";
      chatBtn.className = "chat-button";
      chatBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle-more">
                    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                    <path d="M8 12h.01" />
                    <path d="M12 12h.01" />
                    <path d="M16 12h.01" />
                </svg>
            `;

      // Create the chat section
      const chatSection = document.createElement("div");
      chatSection.id = "chat-bot";
      chatSection.className = "chat-section";
      chatSection.innerHTML = `
                <div class="chat-content">
                    <div class="chat-header">
                        <div class="progress-container">
                            <label class="progress-title"></label>
                            <label class="progress-label" id="progress-label"></label>
                            <div class="progress-bar" id="progress-bar"></div>
                        </div>
                    </div>
                    <div class="chat-body">
                        <div id="chat-content" class="chat-canvas"></div>
                    </div>
                </div>
            `;

      // Append elements inside the div with id "chatbot-js"
      const chatbotContainer = document.getElementById("chatbot-js");
      if (chatbotContainer) {
        chatbotContainer.appendChild(chatBtn);
        chatbotContainer.appendChild(chatSection);
      }

      // Ensure jQuery is ready before using it
      $(document).ready(function () {
        $("#chat-btn").on("click", function () {
          $("#chat-bot").toggleClass("active");
        });
      });

      //
      $(() => {
        let config = [
          {
            prompt: [
              "Thank you for choosing! ABC Company",
              "Now how can i help you?",
            ],
            formControl: [],
          },
          {
            prompt: [
              "This is our services to offer",
              "Please choose one to proceed",
            ],
            formTitle: [],
            formControl: [
              {
                type: "button-group",
                property: {
                  name: "services",
                  value: "",
                  label: "Services",
                  field_label: "Service choosed",
                  option: [
                    {
                      label: "Web Development",
                      value: 1,
                    },
                    {
                      label: "Mobile Developent",
                      value: 2,
                    },
                    {
                      label: "SEO",
                      value: 3,
                    },
                  ],
                },
                rule: {
                  accept: [1, 3],
                  error: {
                    type: "info",
                    message: ["This service is not available right now."],
                  },
                },
              },
            ],
            response: [
              {
                text: ["Thank you for choosing this services! {0}"],
                format: ["text"],
              },
            ],
          },
          {
            prompt: ["What is gender?"],
            formTitle: [],
            formControl: [
              {
                type: "button-group",
                property: {
                  name: "gender",
                  value: "",
                  label: "Gender",
                  field_label: "Gender",
                  option: [
                    {
                      label: "Male",
                      value: "male",
                    },
                    {
                      label: "Female",
                      value: "female",
                    },
                  ],
                },
                rule: {
                  accept: ["male", "female"],
                  error: {
                    type: "list",
                    message: ["This gender is not available"],
                  },
                },
              },
            ],
            response: [
              {
                text: ["Your gender is {0}"],
                format: ["text"],
              },
            ],
          },
          {
            prompt: ["Let me know your identity", "Can i have your name"],
            formControl: [
              {
                type: "text",
                property: {
                  name: "firstname",
                  label: "Firstname",
                  field_label: "Firstname",
                  value: "",
                  placeholder: "",
                },
              },
              {
                type: "text",
                property: {
                  name: "lastname",
                  label: "Lastname",
                  field_label: "Lastname",
                  value: "",
                  placeholder: "",
                },
              },
            ],
            response: [
              {
                text: ["Thank you! {0}{1}"],
                format: ["text"],
              },
            ],
          },
        ];

        // session
        let err = [];
        let formValues = [];
        let formCheck = [];

        let curIndex = 0;

        let isEnd = false;
        // ui mapping
        var chatbot = $("#chat-bot");
        var chatbtn = $("#chat-btn");
        var content = $("#chat-content");

        // state
        let formData = [];
        let checkingData = [];
        let chatHistory = [];
        let chatbotData = [];

        //progress offset
        let offset = 1;

        var acceptInputs = [
          "text",
          "select",
          "radio",
          "button-group",
          "email",
          "tel",
          "number",
          "textarea",
          "file",
        ];

        class ChatHelper {
          static configProp = null;

          constructor(config) {
            this.config = config;
            this.controlLength = this.getFormControlLength();
          }

          getFormControlLength() {
            return this.config
              .reduce((acc, a) => {
                if (
                  a.hasOwnProperty("formControl") &&
                  a.formControl.length > 0
                ) {
                  acc.push(a.formControl);
                }
                return acc;
              }, [])
              .filter((control) => control.some((v) => v.type !== "img"))
              .length;
          }

          getObjectPropConfig(index) {
            if (index >= 0 && index < this.config.length) {
              const obj = this.config[index];
              const properties = Object.keys(obj).reduce((val, key) => {
                val[key] = obj[key];
                return val;
              }, {});
              return properties;
            }
          }

          appendContent(html) {
            if (content) {
              content.append(html);
              this.scrollToBottom(content);
            }
          }

          getPrompt(index, argArr = []) {
            const obj = this.getObjectPropConfig(index);
            if (typeof obj?.prompt === "undefined") return [];
            return argArr.length > 0 && Array.isArray(argArr)
              ? [...obj?.prompt, ...argArr]
              : obj?.prompt;
          }

          getControl(index, argArr = []) {
            const obj = this.getObjectPropConfig(index);
            if (typeof obj?.formControl === "undefined") return [];
            return argArr.length > 0 && Array.isArray(argArr)
              ? [...obj?.formControl, ...argArr]
              : obj?.formControl;
          }

          getValidateRules(e) {
            const { currentIndex, fieldId, getValue, value } = e;
            const obj = this.getObjectPropConfig(currentIndex);
            if (obj.hasOwnProperty("formControl")) {
              let isValid = false;
              const { formControl: controls } = obj;
              if (controls.length <= 1) {
                for (let idx in controls) {
                  const field = controls[idx];
                  if (
                    typeof field?.rule !== "undefined" &&
                    ["button-group", "radio", "select"].includes(field.type)
                  ) {
                    const { accept } = field?.rule;

                    const isMapped = accept.some((curVal, _idx) => {
                      if (accept.every((item) => typeof item === "string")) {
                        return curVal === getValue[idx].value;
                      } else if (
                        accept.every((item) => typeof item === "number")
                      ) {
                        return +curVal === +getValue[idx].value;
                      }
                      return false;
                    });

                    if (!isMapped) {
                      if (typeof field.rule.error !== "undefined") {
                        const { type, message } = field.rule.error;
                        this.appendErrorRules(
                          {
                            type,
                            message,
                            formIndex: currentIndex,
                          },
                          field
                        );
                      }
                    } else {
                      isValid = true;
                    }
                  } else {
                    if (
                      typeof field?.rule === "undefined" &&
                      ["button-group", "radio", "select"].includes(field.type)
                    ) {
                      if (typeof field.rule.error !== "undefined") {
                        const { type, message } = field.rule.error;
                        this.appendErrorRules(
                          {
                            type,
                            message,
                            formIndex: currentIndex,
                          },
                          field
                        );
                      } else {
                        this.appendErrorRules(
                          {
                            type: "system",
                            message: [
                              "Rule error properties are not unmapped.",
                            ],
                            formIndex: currentIndex,
                          },
                          field
                        );
                      }
                    } else {
                      isValid = true;
                    }
                  }
                }
              } else {
                let failedCount = 0;
                let failedIndices = [];

                const relevantControls = controls.filter((field, i) =>
                  Object.values(getValue).some(
                    (item) => +item.field_index === i
                  )
                );

                relevantControls.forEach((field, i) => {
                  if (
                    typeof field.rule !== "undefined" ||
                    ["button-group", "radio", "select"].includes(field.type)
                  ) {
                    const { error, accept } = field.rule;
                    const fieldEntry = Object.values(getValue).filter(
                      (item) => +item.field_index === i
                    )[0];

                    const isMapped = accept.some((curVal, _idx) => {
                      if (accept.every((item) => typeof item === "string")) {
                        return curVal === getValue[i].value;
                      } else if (
                        accept.every((item) => typeof item === "number")
                      ) {
                        return +curVal === +getValue[i].value;
                      }
                      return false;
                    });

                    if (fieldEntry && !isMapped) {
                      failedCount++;
                      failedIndices.push(i); // Store the failed index
                    }
                  } else {
                    isValid = true;
                  }
                });
                if (failedCount === 0) {
                  isValid = true;
                } else {
                  for (let e = 0; e < failedIndices.length; e++) {
                    const field = controls[failedIndices[e]];
                    if (typeof field.rule !== "undefined") {
                      const { type, message } = field.rule.error;
                      this.appendErrorRules(
                        {
                          type,
                          message,
                          formIndex: currentIndex,
                        },
                        field
                      );
                    }
                  }
                }
              }
              return isValid;
            }
          }

          appendErrorRules(e, field) {
            const { type, message: errMsg, formIndex } = e;

            let html = ``;
            if (type === "info") {
              html += `
                                            <div class="chat-form-end">
                                                <div class="end-content">
                                                    <div class="end-header">
                                                        <img src="/assets/img/information.png" alt="ico" lazy="loading"/>
                                                    </div>
                                                    <div class="end-body">`;

              if (Array.isArray(errMsg) && errMsg.length > 0) {
                for (const err in errMsg) {
                  html += `<p>${errMsg[err]}</p>`;
                }
              } else {
                html += `<p>Add error text message</p>`;
              }
              html += `<img src="/assets/img/customer-service.png" alt="ico" lazy="loading" />
                                                    <div>
                                                    <div class="end-control">
                                                        <button type="button" id="btn-end-chat" class="end-chat-btn" >Close chat</button>
                                                    <div>
                                                </div>
                                        </div>
                                    `;
            } else if (type === "list") {
              html += `
                                            <div class="chat-form-end">
                                                <div class="end-content">
                                                    <div class="end-header">
                                                        <img src="/assets/img/information.png" alt="ico" lazy="loading" />
                                                    </div>
                                                    <div class="end-body">`;
              if (Array.isArray(errMsg) && errMsg.length > 0) {
                for (const err in errMsg) {
                  html += `<p>${errMsg[err]}</p>`;
                }
              } else {
                html += `<p>Add error text message</p>`;
              }
              html += `
                                            <div>
                                                <div class="end-control">
                                                    <button type="button" id="btn-move-form" form-id="${formIndex}" class="end-chat-btn" >Please select another option.</button>
                                                <div>
                                            </div>
                                        </div>
                                    `;
            } else if (type === "system") {
              html += `
                                            <div class="chat-form-end">
                                                <div class="end-content">
                                                    <div class="end-header">
                                                        <img src="/assets/img/information.png" alt="ico" lazy="loading" />
                                                    </div>
                                                    <div class="end-body">`;
              if (Array.isArray(errMsg) && errMsg.length > 0) {
                for (const err in errMsg) {
                  html += `<p>${errMsg[err]}</p>`;
                }
              } else {
                html += `<p>Add error text message</p>`;
              }
              html += `
                                            <div>
                                                <div class="end-control">
                                                    <button type="button" id="btn-move-form" form-id="${formIndex}" class="end-chat-btn" >Please select another option.</button>
                                                <div>
                                            </div>
                                        </div>
                                    `;
            }
            chatHistory.push({
              index: +formIndex,
              type: "error",
              content: field.rule,
            });
            this.appendContent(html);
          }
          transposedFormat(params) {
            const { message, values, controls } = params;

            const formatMessage = message.replace(
              /{(\d+)}/g,
              (match, index) => {
                const found = values.find(
                  (field) => +field.field_index === Number(index)
                );

                if (found) {
                  let foundValue = found.value;
                  let fieldIdx = found.field_index;
                  let html = "";
                  let isOption = false;

                  controls.forEach((_field, idx) => {
                    if (_field?.property?.hasOwnProperty("option")) {
                      isOption = true;
                      if (isOption) {
                        let optVal = _field?.property?.option.find((opt) =>
                          typeof opt.value === "number"
                            ? +opt.value === +foundValue
                            : opt.value === foundValue
                        );
                        if (optVal) {
                          html += `<span id="chat-response-entry-${fieldIdx}">${optVal.label}</span>`;
                        }
                      }
                    }
                  });

                  if (!isOption) {
                    if (foundValue instanceof File) {
                      const imageUrl = URL.createObjectURL(foundValue);
                      html = `<img src="${imageUrl}" alt="Preview" id="chat-response-entry-${fieldIdx}" style="max-width: 150px; max-height: 150px; border-radius: 3px;" lazy="loading" />`;
                    } else {
                      html = `<span id="chat-response-entry-${fieldIdx}">${foundValue}</span>`;
                    }
                  } else {
                    if (foundValue instanceof File) {
                      const imageUrl = URL.createObjectURL(foundValue);
                      html = `<img src="${imageUrl}" alt="Preview" id="chat-response-entry-${fieldIdx}" style="max-width: 150px; max-height: 150px; border-radius: 3px;" lazy="loading" />`;
                    }
                  }

                  return html;
                } else {
                  return "";
                }
              }
            );
            return formatMessage.trim().replace(/\s+/g, " ");
          }

          generateResponse(e) {
            const {
              currentIndex: index,
              getValue: inputedVal,
              fieldId,
              fieldIndex,
            } = e;
            const obj = this.getObjectPropConfig(index);

            if (obj?.hasOwnProperty("response")) {
              const resTemplate = obj.response;
              const controls = this.getControl(index);

              let html = ``;

              resTemplate.forEach((item, _index) => {
                const { text, format } = item;

                html += `<div class="chat-prompt chat-res-entry-${index}"  >
                                                <div class="chat-agent">
                                                    <img src="/assets/img/customer-service.png" lazy="loading" />
                                                </div>
                                                <div class="prompt-container">`;

                if (text instanceof Array) {
                  if (format.includes("uploading")) {
                    for (let i = 0; i < text.length; i++) {
                      let formattedHTML = this.transposedFormat({
                        message: text[i],
                        values: inputedVal,
                        controls,
                      });
                      html += `<div id="chat-response-${index}-${i}-${_index}">
                                                            ${formattedHTML}
                                                        </div>`;
                    }
                  }

                  if (format.includes("text")) {
                    for (let i = 0; i < text.length; i++) {
                      let formattedHTML = this.transposedFormat({
                        message: text[i],
                        values: inputedVal,
                        controls,
                      });

                      html += `<div id="chat-response-${index}-${i}-${_index}">
                                                            ${formattedHTML}
                                                        </div>`;
                    }
                  }

                  if (format.includes("currency")) {
                    const currencyFormatter = new Intl.NumberFormat("ja-JP", {
                      style: "currency",
                      currency: "JPY",
                    });
                    for (let i = 0; i < text.length; i++) {
                      const currencyValue = this.transposedFormat({
                        message: text[i],
                        values: inputedVal,
                        controls,
                      });
                      const numericValue = parseFloat(currencyValue);
                      if (!isNaN(numericValue)) {
                        const formattedCurrency =
                          currencyFormatter.format(numericValue);
                        html += `<div id="chat-reponse-${index}-${i}-${_index}" >${formattedCurrency}</div>`;
                      } else {
                        html += `<div id="chat-reponse-${index}-${i}-${_index}" >${currencyValue}</div>`;
                      }
                    }
                  }
                  if (format.includes("telephone")) {
                    for (let i = 0; i < text.length; i++) {
                      const telephoneValue = this.transposedFormat({
                        message: text[i],
                        values: inputedVal,
                        controls,
                      });

                      const formattedTelephone = telephoneValue.replace(
                        /(\d{3})(\d{4})(\d{4})/,
                        "$1-$2-$3"
                      );
                      html += `<div id="chat-response-${index}-${i}-${_index}">${formattedTelephone}</div>`;
                    }
                  }

                  if (format.includes("image")) {
                    const newVal = [];
                    $(`#chat-form-${+index} input[type="file"]`).each(
                      function () {
                        let fieldId = $(this).attr("field-id");
                        if (this.files.length > 0) {
                          for (let i = 0; i < this.files.length; i++) {
                            newVal.push({
                              field_index: fieldId,
                              value: this.files[i],
                            });
                          }
                        }
                      }
                    );

                    for (let i = 0; i < text.length; i++) {
                      let imagePreview = this.transposedFormat({
                        message: text[i],
                        values: newVal,
                        controls,
                      });

                      html += `<div id="chat-response-${index}-${i}-${_index}">
                                                            ${imagePreview}
                                                    </div>`;
                    }
                  }
                }
                html += `   </div>
                                            </div>`;
              });
              this.appendContent(html);
            }
          }

          regenerateResponse(e) {
            const { fieldId, index, name, value } = e;
            const obj = this.getObjectPropConfig(index);

            if (typeof obj.response === "undefined") return;

            const { formControl: controls, response: resTemplate } = obj;

            const formSelector = `#chat-form-${index}`;
            const isValid = validateFormOnEvent(formSelector);

            if (isValid) {
              let values = [];
              if ($(formSelector).find("input, select").length > 0) {
                $(formSelector)
                  .find("input, select")
                  .each(function (e) {
                    const fieldId = $(this).attr("field-id");
                    const formIndex = $(this).attr("form-id");
                    const typeInput = $(this).attr("type");

                    let valueInput = null;

                    if (typeInput === "file") {
                      if (this.files.length > 0) {
                        valueInput = this.files[0];
                      }
                    } else {
                      valueInput = $(this).val();
                    }

                    if ($(this).is(":radio")) {
                      if ($(this).is(":checked")) {
                        values.push({
                          field_index: fieldId,
                          value: $(this).val().trim(),
                        });
                      }
                    } else {
                      values.push({
                        field_index: fieldId,
                        value: valueInput,
                      });
                    }
                  });
              }
              const selector = $(`.chat-res-entry-${index}`);
              const getValue = values;

              let failedCount = 0;
              let failedIndices = [];

              const relevantControls = controls.filter((field, i) =>
                Object.values(getValue).some((item) => +item.field_index === i)
              );

              let _isValid = false;

              relevantControls.forEach((field, i) => {
                if (
                  typeof field.rule !== "undefined" ||
                  ["button-group", "radio", "select"].includes(field.type)
                ) {
                  const { error, accept } = field.rule;
                  const fieldEntry = Object.values(getValue).filter(
                    (item) => +item.field_index === i
                  )[0];

                  const isMapped = accept.some((curVal, _idx) => {
                    if (accept.every((item) => typeof item === "string")) {
                      return curVal === getValue[i].value;
                    } else if (
                      accept.every((item) => typeof item === "number")
                    ) {
                      return +curVal === +getValue[i].value;
                    }
                    return false;
                  });

                  if (fieldEntry && !isMapped) {
                    failedCount++;
                  }
                } else {
                  _isValid = true;
                }
              });

              if (failedCount > 0) {
                _isValid = false;
              } else {
                _isValid = true;
              }

              if (selector.find(".prompt-container").length > 0) {
                resTemplate.forEach((item, _index) => {
                  const { text, format } = item;

                  if (format.includes("uploading")) {
                    const fileImgArr = [];
                    $(`#chat-form-${+index} input[type="file"]`).each(
                      function () {
                        let fieldId = $(this).attr("field-id");
                        if (this.files.length > 0) {
                          for (let i = 0; i < this.files.length; i++) {
                            fileImgArr.push({
                              field_index: fieldId,
                              value: this.files[i],
                            });
                          }
                        }
                      }
                    );

                    const newValues = values.map((v, idx) => {
                      return {
                        field_index: v.field_index,
                        value:
                          fileImgArr.find(
                            (item) => +item.field_index === +v.field_index
                          )?.value ?? v.value,
                      };
                    });

                    for (let i = 0; i < text.length; i++) {
                      let formattedMessage = this.transposedFormat({
                        message: text[i],
                        values: newValues,
                        controls,
                      });
                      if (!_isValid) {
                        if (
                          selector.find(
                            `.prompt-container .error-message-${index}${i}`
                          ).length === 0
                        ) {
                          selector
                            .find(`.prompt-container`)
                            .append(
                              `<div class="error-message-${index}${i}">The option you selected is no longer available. We have selected a more current option instead.</div>`
                            );
                          const errorMessageElement = selector.find(
                            `.prompt-container .error-message-${index}${i}`
                          );
                          if (errorMessageElement.length > 0) {
                            errorMessageElement[0].scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            });
                          }
                          break;
                        }
                      } else {
                        selector
                          .find(`.prompt-container .error-message-${index}${i}`)
                          .remove();
                        selector
                          .find(
                            `.prompt-container #chat-response-${index}-${i}-${_index}`
                          )
                          .empty()
                          .append(formattedMessage);
                      }
                    }
                  }

                  if (format.includes("text")) {
                    for (let i = 0; i < text.length; i++) {
                      let formattedMessage = this.transposedFormat({
                        message: text[i],
                        values: values,
                        controls,
                      });
                      if (!_isValid) {
                        if (
                          selector.find(
                            `.prompt-container .error-message-${index}${i}`
                          ).length === 0
                        ) {
                          selector
                            .find(`.prompt-container`)
                            .append(
                              `<div class="error-message-${index}${i}">The option you selected is no longer available. We have selected a more current option instead.</div>`
                            );
                          const errorMessageElement = selector.find(
                            `.prompt-container .error-message-${index}${i}`
                          );
                          if (errorMessageElement.length > 0) {
                            errorMessageElement[0].scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            });
                          }
                          break;
                        }
                      } else {
                        selector
                          .find(`.prompt-container .error-message-${index}${i}`)
                          .remove();
                        selector
                          .find(
                            `.prompt-container #chat-response-${index}-${i}-${_index}`
                          )
                          .empty()
                          .append(formattedMessage);
                      }
                    }
                  }

                  if (format.includes("currency")) {
                    const currencyFormatter = new Intl.NumberFormat("ja-JP", {
                      style: "currency",
                      currency: "JPY",
                    });
                    for (let i = 0; i < text.length; i++) {
                      const currencyValue = this.transposedFormat({
                        message: text[i],
                        values: values,
                        controls,
                      });
                      const numericValue = parseFloat(currencyValue);
                      let validatedCurrency = "";
                      if (!isNaN(numericValue)) {
                        const formattedCurrency =
                          currencyFormatter.format(numericValue);
                        validatedCurrency = formattedCurrency;
                      } else {
                        validatedCurrency = currencyValue;
                      }

                      if (!_isValid) {
                        if (
                          selector.find(
                            `.prompt-container .error-message-${index}${i}`
                          ).length === 0
                        ) {
                          selector
                            .find(`.prompt-container`)
                            .append(
                              `<div class="error-message-${index}${i}">The option you selected is no longer available. We have selected a more current option instead.</div>`
                            );
                          const errorMessageElement = selector.find(
                            `.prompt-container .error-message-${index}${i}`
                          );
                          if (errorMessageElement.length > 0) {
                            errorMessageElement[0].scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            });
                          }
                          break;
                        }
                      } else {
                        selector
                          .find(`.prompt-container .error-message-${index}${i}`)
                          .remove();
                        selector
                          .find(
                            `.prompt-container #chat-response-${index}-${i}-${_index}`
                          )
                          .empty()
                          .append(validatedCurrency);
                      }
                    }
                  }
                  if (format.includes("telephone")) {
                    for (let i = 0; i < text.length; i++) {
                      const telephoneValue = this.transposedFormat({
                        message: text[i],
                        values: inputedVal,
                        controls,
                      });

                      const validatedTelNum = telephoneValue.replace(
                        /(\d{3})(\d{4})(\d{4})/,
                        "$1-$2-$3"
                      );

                      if (!_isValid) {
                        if (
                          selector.find(
                            `.prompt-container .error-message-${index}${i}`
                          ).length === 0
                        ) {
                          selector
                            .find(`.prompt-container`)
                            .append(
                              `<div class="error-message-${index}${i}">The option you selected is no longer available. We have selected a more current option instead.</div>`
                            );
                          const errorMessageElement = selector.find(
                            `.prompt-container .error-message-${index}${i}`
                          );
                          if (errorMessageElement.length > 0) {
                            errorMessageElement[0].scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            });
                          }
                          break;
                        }
                      } else {
                        selector
                          .find(`.prompt-container .error-message-${index}${i}`)
                          .remove();
                        selector
                          .find(
                            `.prompt-container #chat-response-${index}-${i}-${_index}`
                          )
                          .empty()
                          .append(validatedTelNum);
                      }
                    }
                  }

                  if (format.includes("image")) {
                    const newVal = [];
                    $(`#chat-form-${+index} input[type="file"]`).each(
                      function () {
                        let fieldId = $(this).attr("field-id");
                        if (this.files.length > 0) {
                          for (let i = 0; i < this.files.length; i++) {
                            newVal.push({
                              field_index: fieldId,
                              value: this.files[i],
                            });
                          }
                        }
                      }
                    );

                    for (let i = 0; i < text.length; i++) {
                      let imagePreview = this.transposedFormat({
                        message: text[i],
                        values: newVal,
                        controls,
                      });

                      if (!_isValid) {
                        if (
                          selector.find(
                            `.prompt-container .error-message-${index}${i}`
                          ).length === 0
                        ) {
                          selector
                            .find(`.prompt-container`)
                            .append(
                              `<div class="error-message-${index}${i}">The option you selected is no longer available. We have selected a more current option instead.</div>`
                            );
                          const errorMessageElement = selector.find(
                            `.prompt-container .error-message-${index}${i}`
                          );
                          if (errorMessageElement.length > 0) {
                            errorMessageElement[0].scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            });
                          }
                          break;
                        }
                      } else {
                        selector
                          .find(`.prompt-container .error-message-${index}${i}`)
                          .remove();
                        selector
                          .find(
                            `.prompt-container #chat-response-${index}-${i}-${_index}`
                          )
                          .empty()
                          .append(imagePreview);
                      }
                    }
                  }
                });
              }
            }
          }

          scrollToBottom(element) {
            if (element && element[0]) {
              $(element).animate(
                {
                  scrollTop: element[0].scrollHeight,
                },
                "slow"
              );
            }
          }

          hasPropertyOf(name) {
            return this.config.some((item) => item.hasOwnProperty(name));
          }

          revalidateInputForm(controls) {
            let arr = [];

            if (checkingData.length > 0) {
              arr = controls.filter((control) => {
                if (!control.hasOwnProperty("is_view")) {
                  return true;
                }

                return checkingData.some((data) => {
                  if (control.is_view.hasOwnProperty(data.name)) {
                    return control.is_view[data.name].includes(
                      parseInt(data.value)
                    );
                  }
                  return false;
                });
              });
            } else {
              arr = controls;
            }
            return arr;
          }

          appendInputForm(index, controls, formId) {
            // input [text, tel, email, number] textarea, select, radio, file]
            let html = ``;
            let errInput = [];

            // Filter form controls with the is_view property based on parsed input data.
            let filteredControl = this.revalidateInputForm(controls);

            for (var i = 0; i < filteredControl.length; i++) {
              const { type, property, description, style } = filteredControl[i];

              if (Object.keys(property).length === 0)
                errInput.push(
                  "<p>Has not property attibutes for this field.</p>"
                );

              const { name, value } = property;

              const desc =
                typeof description !== "undefined"
                  ? `<span>${description}</span>`
                  : "";
              const inputId = index + i + formId;

              if (["text", "tel", "email", "number"].includes(type)) {
                const { label } = property;

                const forNumber = type === "number" ? 'min="1"' : " ";
                const placeholder =
                  typeof property.placeholder !== "undefined"
                    ? property.placeholder
                    : "";
                const indent =
                  typeof style !== "undefined"
                    ? style["flex-wrap"] === "wrap"
                      ? "form-field-control-grid"
                      : ""
                    : "form-field-control";

                html += `<div class="${indent}">
                                                <label for="${inputId}">${label}</label>
                                                <div class="form-group">
                                                    <input type="${type}" name="${name}" id="${inputId}" value="${value}" class="field-input" field-id="${i}" form-index="${formId}" form-id="${index}" placeholder="${placeholder}" autocomplete="false"    
                                                        ${forNumber}
                                                    />
                                                    ${desc}
                                                </div>
                                            </div>`;
              } else if (["select"].includes(type)) {
                const selectedValue =
                  checkingData.length > 0
                    ? checkingData.find((field) => field.name === name)?.value
                    : "";
                const { option, label } = property;
                const indent =
                  typeof style !== "undefined"
                    ? style["flex-wrap"] === "wrap"
                      ? "form-field-control-grid"
                      : ""
                    : "form-field-control";
                html += `<div class="${indent}">
                                                <label for="${inputId}">${label}</label>
                                                <div class="form-group">
                                                    <select name="${name}" id="${inputId}" class="field-input" field-id="${i}" form-index="${formId}" form-id="${index}">`;
                html += option
                  ?.map(
                    (item) =>
                      `<option value="${item.value}" ${
                        +item.value === +selectedValue ? "selected" : ""
                      } >${item.label}</option>`
                  )
                  .join("");
                html += `       </select>
                                                    ${desc}
                                                </div>
                                            </div>`;
              } else if (["radio"].includes(type)) {
                const { option, label } = property;

                html += `<div class="form-rdo-group">
                                                <label>${label}</label>`;
                html += option
                  .map(
                    (item, idx) => `
                                                    <label class="rdo-field">
                                                        <input type="radio" name="${name}" class="field-input" field-id="${i}" form-index="${formId}" form-id="${index}" id="rdo-${
                      inputId + idx
                    }" value="${item.value}" />
                                                        <span class="radio-span"></span>
                                                        ${item.label}
                                                    </label>`
                  )
                  .join("");
                html += ` ${desc}
                                            </div>`;
              } else if (["button-group"].includes(type)) {
                const { option, label } = property;

                html += `<label>${label}</label>
                                                <div class="form-btn-group">`;

                html += option
                  .map(
                    (item, idx) => `<div class="btn-group">
                                                <input type="radio" name="${name}" class="field-input" field-id="${i}" form-index="${formId}" form-id="${index}" id="rdo-${
                      inputId + idx
                    }" value="${item.value}" />
                                                <label for="rdo-${
                                                  inputId + idx
                                                }" class="field-radio-btn">${
                      item.label
                    }</label>
                                            </div>`
                  )
                  .join("");

                html += `</div>`;
              } else if (["textarea"].includes(type)) {
                html += `<div class="form-field-control">
                                                <label for="${inputId}">${label}</label>`;
                html += `<textarea name="${name}" id="${inputId}" rows="4" class="field-input" form-id="${index}" >${property?.placeholder}</textarea>`;
                html += `</div>`;
              } else if (["file", "img"].includes(type)) {
                const { label } = property;

                const placeholder =
                  typeof property.placeholder !== "undefined"
                    ? property.placeholder
                    : "";
                const indent =
                  typeof style !== "undefined"
                    ? style["flex-wrap"] === "wrap"
                      ? "form-field-control-grid"
                      : ""
                    : "form-field-control";

                html += `<div class="${indent}">`;

                if (controls.length > 1) {
                  if (typeof property.src !== "undefined") {
                    html += `<div class="form-img"><img src="${property?.src}" width="90%" lazy="loading" /></div>`;
                  }
                }
                if (type === "file") {
                  html += `<label for="${inputId}">${label}</label>
                                                <div class="form-group">
                                                    <input type="${type}" name="${name}" id="${inputId}" value="${value}" accept="image/*"  class="field-input" field-id="${i}" form-index="${formId}" form-id="${index}" placeholder="${placeholder}" autocomplete="false" />
                                                    ${desc}
                                                </div>
                                            </div>`;
                }
              } else {
                errInput.push("<p>Control type is unmapped</p>");
              }
            }
            return html;
          }

          appendPrompt(index) {
            let html = ``;
            const prompt = this.getPrompt(index);
            html += `<div class="chat-prompt" id="chat-prompt-${index}" >
                                                                <div class="chat-agent">
                                                                    <img src="/assets/img/customer-service.png" lazy="loading" />
                                                                </div>
                                                                <div class="prompt-container">`;
            for (const index in prompt) {
              html += `<div>${prompt[index]}</div>`;
            }
            html += `   </div>
                                    </div>`;
            chatHistory.push({
              index,
              type: "prompt",
              content: prompt,
            });
            this.appendContent(html);
          }

          appendForm(index, formId) {
            const obj = this.getObjectPropConfig(index);
            const controls = obj?.formControl;
            let html = ``;

            const isInputs = controls?.some((item) =>
              acceptInputs.includes(item.type)
            ); // make sure the types is matching entry type;

            if (controls?.length === 0 || !isInputs) return html;

            html += `<div class="chat-form-control"  >`;
            html += `   <div class="form-content">`;

            if (obj.hasOwnProperty("formTitle")) {
              const titles = obj.formTitle;
              for (const arr in titles) {
                html += `<label class="form-title">${titles[arr]}</label>`;
              }
            }

            html += `<div class="form-field" id="chat-form-${index}">`;
            html += this.appendInputForm(index, controls, formId);
            html += `</div>`;

            if (
              controls.filter((v) => v.type === "button-group").length === 1
            ) {
            } else {
              html += `<div class="form-control">
                                            <button type="submit" id="form-btn-submit-${index}" form-id="${index}" class="form-btn-submit" >Next</button>
                                        </div>`;
            }
            html += ` </div>
                                    </div>`;

            chatHistory.push({
              index,
              type: "form",
              content: controls,
            });

            return html;
          }

          appendControlConfig(index) {
            const controls = this.getControl(index);
            let html = ``;
            let formId = 0;

            for (const i in controls) {
              const { type, property } = controls[i];
              formId = index + i;
              if (type === "img" && controls.length === 1) {
                // banner only (info or some image to view)
                html += `<div class="info-control-form">
                                                <img src="${property?.src}" lazy="loading" />
                                            </div>`;
                index += 1;
              }
            }

            html += this.appendForm(index, formId);
            this.appendContent(html);
          }

          renderedLog(index) {
            const prompt = this.getPrompt(index);
            if (prompt.length > 0 && typeof prompt !== "undefined") {
              this.appendPrompt(index);
            }
            this.appendControlConfig(index);
            this.updateFormProgress(index);
          }

          renderedChat() {
            const arrOffset = [...Array(offset).keys()]; //Add initial prompt and form. note: every submit of the button if has. the next index of current will rendered.
            const makeIndex = arrOffset;
            if (makeIndex.length > 0) {
              for (var i in makeIndex) {
                this.renderedLog(makeIndex[i]);
                curIndex++;
              }
            }
            this.renderedLog(curIndex);
          }

          updateFormProgress(index) {
            // const currentStep = index;
            // const totalSteps = this.getFormControlLength();
            // const currPercent = ((currentStep) / (totalSteps)) * 100;
            // const getPercentage = Math.min(100, Math.max(0, currPercent));
            // $('#progress-bar').css('width', getPercentage + '%');
            // $('#progress-label').text(`${currentStep -  offset}/${totalSteps}`);
            const currentStep = index;
            const totalSteps = this.config.length;
            const currPercent =
              ((currentStep - offset) / (totalSteps - offset)) * 100;
            const getPercentage = Math.min(100, Math.max(0, currPercent));
            $("#progress-bar").css("width", getPercentage + "%");
            $("#progress-label").text(
              `${currentStep - offset}/${totalSteps - offset}`
            );
          }
        }

        const chatHelper = new ChatHelper(config);

        const getHistory = () => {
          let data = history;
          let html = ``;
          if (data.length > 0) {
            for (var i in data) {
              const { type, index, content } = data[i];
              switch (type) {
                case "prompt":
                  chatHelper.appendPrompt(index);
                  break;
                case "form":
                  chatHelper.appendControlConfig(index);
                  break;
              }
            }
          }
          return {
            hasData: data.length > 0,
            template: html,
          };
        };

        $(document).on("click", ".error-btn-close", function () {
          $(this).closest(".error-msg-pop").fadeOut(); // Hide the error pop-up smoothly
        });

        $(document).ready(() => {
          if (window.location.hash === "#chatbot" && err.length > 0) {
            let storedContent = sessionStorage.getItem("formHtml");
            if (storedContent) {
              $("#chat-content").html(storedContent);
            }
            let html = `
                                <div class="error-msg-pop">
                                <div class="error-msg-content">
                                <button class="error-btn-close">&times;</button>
                                    <div class="error-msg-body">`;
            html += err
              .map((msg) => `<p id="error-msg-list">${msg}</p>`)
              .join("");
            html += `</div>
                                    </div>
                                </div>`;
            $("#chat-content").append(html);
            chatbtn.html(
              '<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>'
            );
            chatbot.show();
          }
        });

        let isChatRendered = false;
        const isChatting = () => {
          let isVisible = chatbot.is(":visible");
          if (isVisible) {
            chatbot.hide();
            chatbtn.html(
              '<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle-more"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/></svg>'
            );
          } else {
            chatbot.show();
            if (!isChatRendered && err.length === 0) {
              chatHelper.renderedChat();
              isChatRendered = true; // Set the flag to true after rendering
            }
            chatbtn.html(
              '<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>'
            );
          }
        };

        const hasEntry = (index) => config.length > index;

        chatbtn.on("click", () => {
          isChatting();
        });

        const scrollToForm = (e) => {
          const targetIdForm = $(e.currentTarget).attr("form-id");
          const $chatContent = $("#chat-content");
          const targetElement = $(`#chat-form-${targetIdForm}`);
          const scrollPosition =
            targetElement.offset().top -
            $chatContent.offset().top +
            $chatContent.scrollTop() -
            70;
          $chatContent.animate(
            {
              scrollTop: scrollPosition,
            },
            500
          );
        };

        const scrollToBottom = (element) => {
          element.animate(
            {
              scrollTop: element.prop("scrollHeight"),
            },
            500
          );
        };

        $(document).on("click", "#btn-move-form", (e) => {
          scrollToForm(e);
        });

        $(document).on("click", '.field-input:input[type="radio"]', (e) => {
          const { type, value, name } = e.target;

          const id = $(e.currentTarget).attr("id");
          const fieldId = $(e.currentTarget).attr("field-id");
          const formIndex = $(e.currentTarget).attr("form-id");

          const fieldParams = {
            currentIndex: curIndex,
            getValue: [
              {
                field_index: fieldId,
                value,
              },
            ],
            value,
            fieldId,
            name,
            index: formIndex,
          };

          const controls = chatHelper.getControl(formIndex);
          const hasBtnGroup =
            controls?.filter((v) => v.type === "button-group").length >= 1 &&
            controls.length <= 1;
          const isCurForm = +curIndex !== +formIndex; //current form
          if (hasBtnGroup && !isCurForm) {
            const isValidRules = chatHelper.getValidateRules(fieldParams);
            if (isValidRules) {
              chatHelper.generateResponse(fieldParams);
              curIndex = curIndex + 1;
              if (hasEntry(curIndex)) {
                chatHelper.renderedLog(curIndex);
              } else {
                isEndCheckingForm();
              }
            }
          }
          generateInputData(fieldParams);
        });

        const generateInputData = (params) => {
          const { name, value, index, fieldId } = params;

          const control = chatHelper.getControl(index)?.[fieldId];

          let fieldLabel =
            typeof control?.property?.field_label !== "undefined"
              ? control?.property?.field_label
              : control?.property?.label;
          let fieldVal =
            typeof control?.property?.option !== "undefined"
              ? control?.property?.option.filter((item) => {
                  if (typeof item.value === "number") {
                    return +item.value === +value;
                  } else if (typeof item.value === "string") {
                    return item.value === value;
                  }
                  return false;
                })[0]?.label
              : (() => {
                  if (name == "amount") {
                    return value; // include denomination string value + "$", + "Php"
                  }
                  return value;
                })();

          let obj = {};

          if (value instanceof File) {
            //....
          } else {
            if (value?.trim().length === 0) return;
          }

          // get the name attributes of input when the changing the existing input with conditional view input field
          const removeInput = chatHelper
            .getControl(index)
            .filter((control, idx) => {
              if (!control.hasOwnProperty("is_view")) return;
              return checkingData.some((data) => {
                if (control.is_view.hasOwnProperty(data.name)) {
                  return !control.is_view[data.name].includes(
                    parseInt(data.value)
                  );
                }
                return false;
              });
            })
            .map((control) => control?.property?.name)
            .filter(Boolean);

          obj = {
            formIndex: index,
            fieldIndex: fieldId,
            selectVal: fieldVal,
            label: fieldLabel,
            value: value,
          };

          formData[name] = obj;

          // delete the key value pair input changes ["is_view"]
          if (removeInput.length > 0) {
            removeInput.forEach((key) => delete formData[key]);
          }

          // this condition prevent the add the value if has error values
          if (
            typeof control?.rule !== "undefined" &&
            !control?.rule?.accept.includes(
              typeof value === "number" ? +value : value
            )
          )
            return;

          const exeptFields = [""]; //inputToRemove //[""]; // if you don't need to include the field named. I used this approach of array ["cardHolderType", ...]

          checkingData = Object.keys(formData)
            .map((item, idx) => {
              if (exeptFields.includes(item)) return null;
              const {
                formIndex,
                label,
                selectVal,
                value: originVal,
              } = formData[item];

              return {
                name: item,
                form_index: formIndex,
                label: label,
                label_val: selectVal,
                value: originVal,
              };
            })
            .filter(Boolean);

          // this condition revalidate when has error
          if (err.length > 0) {
            checkingData.forEach((update) => {
              if (formValues.hasOwnProperty(update.name)) {
                formValues[update.name] = update.value;
              }
            });
            // this case we need to append the code params to fixed undefined values
            checkingData.forEach((updateItem) => {
              let formItem = formCheck.find(
                (item) =>
                  item.name === updateItem.name &&
                  +item.form_index === +updateItem.form_index
              );
              if (formItem) {
                formItem.label = updateItem.label;
                formItem.label_val = updateItem.label_val;
                formItem.value = updateItem.value;
              }
            });
          }
        };

        const isValidatedField = (e, isMsg = true) => {
          const { type, value } = e.target;

          const trimmedValue = value.trim();
          const fieldId = $(e.target).attr("field-id");

          let responseObj = {
            isPass: true,
          };

          let errorMessageSpan = $(`#error-field-${fieldId}`);
          if (isMsg) {
            if (errorMessageSpan.length === 0) {
              errorMessageSpan = $("<span>", {
                id: `error-field-${fieldId}`,
                class:
                  $(e.target).closest(".form-field-control-grid").length > 0
                    ? "error-message-opt"
                    : "error-message",
              }).appendTo(
                $(e.target).closest(
                  ".form-field-control, .form-field-control-grid"
                )
              );
            }
          }

          switch (type) {
            case "text":
              if (trimmedValue.length === 0) {
                responseObj.isPass = false;
                if (isMsg) {
                  $(e.target).addClass("error-field");
                  errorMessageSpan.text("*This field is requird");
                }
              } else {
                responseObj.isPass = true;
                if (isMsg) {
                  $(e.target).removeClass("error-field");
                  errorMessageSpan.remove();
                }
              }
              break;
            case "number":
              const hasPattern = (value) => {
                const input = e.target;
                if (input.getAttribute("pattern")) {
                  return /^(?!0+$)\d+$/.test(value);
                }
                return true;
              };
              if (trimmedValue.length === 0) {
                responseObj.isPass = false;
                if (isMsg) {
                  $(e.target).addClass("error-field");
                  errorMessageSpan.text("*This field is requird");
                }
              } else {
                if (isNaN(trimmedValue) || hasPattern(trimmedValue)) {
                  responseObj.isPass = true;
                  if (isMsg) {
                    $(e.target).removeClass("error-field");
                    errorMessageSpan.remove();
                  }
                } else {
                  responseObj.isPass = false;
                  if (isMsg) {
                    $(e.target).addClass("error-field");
                    errorMessageSpan.text("*Please enter a valid number");
                  }
                }
              }
              break;
            case "email":
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (trimmedValue.length === 0) {
                responseObj.isPass = false;
                if (isMsg) {
                  $(e.target).addClass("error-field");
                  errorMessageSpan.text("*This field is requird");
                }
              } else {
                if (!emailRegex.test(trimmedValue)) {
                  responseObj.isPass = false;
                  if (isMsg) {
                    $(e.target).addClass("error-field");
                    errorMessageSpan.text(
                      "*Please enter a valid email address"
                    );
                  }
                } else {
                  responseObj.isPass = true;
                  if (isMsg) {
                    $(e.target).removeClass("error-field");
                    errorMessageSpan.remove();
                  }
                }
              }
              break;
            case "tel":
              const telRegex = /^\+?[0-9\s\-().]{7,15}$/;
              if (trimmedValue.length === 0) {
                responseObj.isPass = false;
                if (isMsg) {
                  $(e.target).addClass("error-field");
                  errorMessageSpan.text("*This field is required");
                }
              } else {
                if (!telRegex.test(trimmedValue)) {
                  responseObj.isPass = false;
                  if (isMsg) {
                    $(e.target).addClass("error-field");
                    errorMessageSpan.text("*Please enter your contact number");
                  }
                } else {
                  responseObj.isPass = true;
                  if (isMsg) {
                    $(e.target).removeClass("error-field");
                    errorMessageSpan.remove();
                  }
                }
              }
              break;
            case "file":
              const fileInput = $(e.target)[0];
              const file = fileInput.files[0];
              if (file) {
                const fileType = file.type.split("/")[0];
                if (fileType !== "image" || fileInput.files.length === 0) {
                  responseObj.isPass = false;
                  if (isMsg) {
                    $(e.target).addClass("error-field");
                    errorMessageSpan.text("*Only image files are allowed.");
                  }
                } else {
                  responseObj.isPass = true;
                  if (isMsg) {
                    $(e.target).removeClass("error-field");
                    errorMessageSpan.remove();
                  }
                }
              } else {
                responseObj.isPass = false;
                if (isMsg) {
                  $(e.target).addClass("error-field");
                  errorMessageSpan.text("*Only image files are allowed.");
                }
              }
              break;
            default:
              responseObj.isPass = true;
              break;
          }
          return responseObj;
        };

        const validateOptionFields = (selector, isMsg = true) => {
          const hasRadioButtons =
            $(selector).find('input[type="radio"]').length > 0;
          const checkedRadioValues = $(selector)
            .find('input[type="radio"]:checked')
            .map(function () {
              return $(this).val();
            })
            .get();

          const areRadioButtonsValid = !(
            hasRadioButtons && checkedRadioValues.length === 0
          );

          const invalidSelects =
            $(selector)
              .find("select")
              .filter(function () {
                return $(this).val() === null || $(this).val() === "";
              }).length > 0;

          $(selector)
            .find('input[type="radio"], select')
            .each(function () {
              const fieldId = $(this).attr("field-id");
              const fieldType = $(this).attr("type");

              let errorMessageSpan = $(`#error-field-${fieldId}`);
              if (isMsg) {
                if (errorMessageSpan.length === 0) {
                  errorMessageSpan = $("<span>", {
                    id: `error-field-${fieldId}`,
                    class: "error-message-opt",
                    text: "",
                  });
                }
              }

              if (typeof fieldType !== "undefined" && fieldType === "radio") {
                const isChecked =
                  $(this)
                    .closest(".form-rdo-group")
                    .find(`input[type="radio"][field-id="${fieldId}"]:checked`)
                    .length > 0;
                if (!isChecked) {
                  if (isMsg) {
                    const formRdoGroup = $(this).closest(".form-rdo-group");
                    formRdoGroup.append(
                      errorMessageSpan.text("*This field is required")
                    );
                  }
                } else {
                  errorMessageSpan.remove(); // Clear message if valid
                }
              } else {
                if ($(this).val() === null || $(this).val() === "") {
                  if (isMsg) {
                    $(this).addClass("error-field");
                    if ($(selector).find("div.form-field-control").length > 0) {
                      errorMessageSpan
                        .removeClass("error-message-opt")
                        .addClass("error-message")
                        .css("width", "100%")
                        .text("*This field is required")
                        .appendTo(
                          $(this).closest(
                            ".form-field-control-grid, .form-field-control"
                          )
                        );
                    } else {
                      errorMessageSpan
                        .text("*This field is required")
                        .appendTo(
                          $(this).closest(
                            ".form-field-control-grid, .form-field-control"
                          )
                        );
                    }
                  }
                } else {
                  if (isMsg) {
                    $(this).removeClass("error-field");
                    errorMessageSpan.remove();
                  }
                }
              }
            });

          const areSelectsValid = !invalidSelects;

          return areRadioButtonsValid && areSelectsValid;
        };

        const validateForm = (selector) => {
          let isValid = true;
          $(selector)
            .find('input:not([type="button"])')
            .each(function () {
              const { isPass: isFieldValid } = isValidatedField(
                {
                  target: this,
                },
                true
              );

              if (!isFieldValid) {
                isValid = false;
              }
            });
          if (!validateOptionFields(selector, true)) {
            isValid = false;
          }
          return isValid;
        };

        const validateFormOnEvent = (selector) => {
          let isValid = true;
          $(selector)
            .find('input:not([type="button"])')
            .each(function () {
              const { isPass: isFieldValid } = isValidatedField(
                {
                  target: this,
                },
                false
              );

              if (!isFieldValid) {
                isValid = false;
              }
            });

          if (!validateOptionFields(selector, false)) {
            isValid = false;
          }
          return isValid;
        };

        $(document).on("click", "#btn-end-chat", () => {
          isChatting();
        });

        $(document).on("click", ".form-btn-submit", function () {
          const currentIndex = $(this).attr("form-id");
          const formSelector = `#chat-form-${currentIndex}`;

          const isValid = validateForm(formSelector);

          if (!isValid) {
            // rendered prepared error message
          } else {
            let values = [];
            if ($(formSelector).find("input, select").length > 0) {
              $(formSelector)
                .find("input, select")
                .each(function (e) {
                  const fieldId = $(this).attr("field-id");
                  const formIndex = $(this).attr("form-id");
                  const typeInput = $(this).attr("type");

                  let valueInput = null;

                  if (typeInput === "file") {
                    if (this.files.length > 0) {
                      valueInput = this.files[0];
                    }
                  } else {
                    valueInput = $(this).val();
                  }

                  if ($(this).is(":radio")) {
                    if ($(this).is(":checked")) {
                      values.push({
                        field_index: fieldId,
                        value: $(this).val().trim(),
                      });
                    }
                  } else {
                    values.push({
                      field_index: fieldId,
                      value: valueInput,
                    });
                  }

                  const fieldParams = {
                    currentIndex,
                    getValue: [
                      {
                        field_index: fieldId,
                        value: valueInput,
                      },
                    ],
                    value: valueInput,
                    fieldId,
                    name: $(this).attr("name"),
                    index: formIndex,
                  };
                  generateInputData(fieldParams);
                });
            }

            let fieldParams = {
              currentIndex,
              getValue: values,
            };

            const newIndex = +currentIndex + 1;

            const isValidRules = chatHelper.getValidateRules(fieldParams);

            const handleValidRules = () => {
              $(this).prop("disabled", true);

              chatHelper.generateResponse(fieldParams);

              if (hasEntry(newIndex)) {
                curIndex = newIndex;
                chatHelper.renderedLog(curIndex);
                chatHelper.scrollToBottom();
              } else {
                chatHelper.updateFormProgress(newIndex);
                isEndCheckingForm();
              }
            };

            if (err.length > 0) return;

            if (isValidRules) {
              handleValidRules();
            }
          }
        });

        const isEndCheckingForm = () => {
          if (!isEnd) {
            const template = checkingEndForm(checkingData);
            chatHelper.appendContent(template);
            isEnd = true;
          }
        };

        const checkingEndForm = (data) => {
          let html = ``;
          if ($(content).find(".end-form").length === 0) {
            html += `<div class="chat-prompt end-form"  >
                                        <div class="chat-agent">
                                            <img src="/assets/img/customer-service.png" lazy="loading" />
                                        </div>
                                        <div class="prompt-container">
                                            <p>Please check your application details.</p>
                                        </div>
                                    </div>`;
          }
          html += `<div class="checking-content">
                                            <div class="checking-form">
                                                <table class="check-table-form">
                                                    <thead>
                                                        <th width="40%"></th>
                                                        <th width="60%"></th>
                                                    </thead>
                                                    <tbody>`;
          data.map((item) => {
            let itemLabelValue = null;
            if (item.value instanceof File) {
              // is image
              const imageURL = URL.createObjectURL(item.value);
              itemLabelValue = `<img src="${imageURL}" style="max-width: 75px; max-height: 75px; border-radius: 3px; border: 1px solid #D4E6D8;" lazy="loading" />`;
            } else {
              itemLabelValue = item.label_val;
            }
            html += `<tr>
                            <td width="40%"><a id="btn-review-data" form-id="${item.form_index}" >${item.label}</a></td>
                            <td width="60%" style="word-wrap: break-word; word-break: break-all; white-space: normal;line-height: 16px;">${itemLabelValue}</td>
                            </tr>`;
          });
          html += `</tbody>
                                            </table>
                                                <div class="checking-privacy">
                                                    <div>
                                                        <input type="checkbox" id="check-privacy-btn" />
                                                        <label for="check-privacy-btn" >I understand that there is no discrepancy with the above content and that we are not a financial institution.</label>
                                                    </div>
                                                    <small>If there are no differences, please check the box and complete your application.</small>
                                                </div>

                                                <button type="button" id="btn-submit-chat" disabled>Submit</button>
                                            </div>
                                        </div>`;

          return html;
        };

        const getFieldValue = ($field) => {
          const fieldName = $field.attr("name");
          let fieldValue = "";
          if ($field.is('input[type="radio"]')) {
            fieldValue = $(`input[name="${fieldName}"]:checked`).val() || "";
          } else if ($field.is('input[type="checkbox"]')) {
            fieldValue = $(`input[name="${fieldName}"]:checked`)
              .map(function () {
                return this.value;
              })
              .get()
              .join(",");
          } else if ($field.is("select")) {
            fieldValue = $field.find("option:selected").val();
          } else if ($field.is("textarea")) {
            fieldValue = $field.val();
          } else {
            fieldValue = $field.val();
          }
          return {
            fieldName,
            fieldValue,
          };
        };

        const autoFillData = (formIndex, fieldName = []) => {
          if (!Array.isArray(fieldName))
            return console.error("Array of string required!");
          setTimeout(() => {
            fieldName.forEach((field) => {
              const $field = $(`[name="${field}"]`);
              const newfieldId = $field.attr("field-id");
              const { fieldName, fieldValue } = getFieldValue($field);
              generateInputData({
                fieldId: newfieldId,
                index: formIndex,
                name: fieldName,
                value: fieldValue,
              });
            });
          }, 500);
        };

        let isProgrammaticChange = false;

        $(document).on("keyup change", ".field-input", (e) => {
          const { type, name, value } = e.target;

          const id = $(e.currentTarget).attr("id");
          const fieldId = $(e.currentTarget).attr("field-id");
          const formIndex = $(e.currentTarget).attr("form-id");
          const _formIndex = $(e.currentTarget).attr("form-index");

          // if (name === "zipcode") {
          //     AjaxZip3.zip2addr('zipcode', '', 'addr1', 'addr2');
          //     autoFillData(formIndex, ['addr1', 'addr2'])
          // }

          // if (name === "name1") {
          //     $(document).ready(async function() {
          //         const kanjiData = await getKanjiData();
          //         const inputWord = value.trim();
          //         if (kanjiData) {
          //             const harigana = convertKanjiHarigana(kanjiData, inputWord);
          //             const katakana = wanakana.toKatakana(harigana);
          //             $('.field-input[name="name2"]').val(katakana);
          //         }

          //     })
          //     autoFillData(formIndex, ['name1', 'name2']);
          // }

          if (Object.keys(formData).some((key) => key === name)) {
            const fields = $(`select.field-input[name="${name}"]`);
            fields.each(function () {
              if ($(this).val() !== value) {
                isProgrammaticChange = true;
                $(this).val(value).trigger("change");
              }
            });
            isProgrammaticChange = false;
          }

          if (type === "file") {
            generateInputData({
              fieldId,
              index: formIndex,
              name,
              value: e.target.files[0],
            });
          } else {
            // select, option, number, ..etc
            generateInputData({
              fieldId,
              index: formIndex,
              name,
              value,
            });

            setTimeout(() => {
              generateInputDependable({
                name,
                type,
                formIndex,
              });
            }, 50);
          }

          chatHelper.regenerateResponse({
            fieldId,
            index: formIndex,
            name,
            value,
          });

          if (isEnd) {
            $(content).children().slice(-2).remove();
            const template = checkingEndForm(checkingData);
            content.append(template);
          }

          if (!isEnd && err.length > 0) {
            $(content).children().slice(-2).remove();
            const template = checkingEndForm(formCheck);
            content.append(template);
          }
        });

        const generateInputDependable = (prop) => {
          const { name, type, formIndex, _formIndex } = prop;
          const controls = chatHelper.getControl(formIndex);
          if (
            controls.some((config) => {
              return config.hasOwnProperty("is_view");
            })
          ) {
            let inputHtml = chatHelper.appendInputForm(
              formIndex,
              controls,
              _formIndex
            );
            let formSelector = `#chat-form-${formIndex}`;
            $(formSelector).empty().append(inputHtml);
            const hasButtonNearby =
              $(`#chat-form-${formIndex}`)
                .closest(`body`)
                .find(`#form-btn-submit-${formIndex}`).length > 0;
            if (!hasButtonNearby) {
              $(formSelector).append(`<div class="form-control">
                                                        <button type="submit" id="form-btn-submit-${formIndex}" form-id="${formIndex}"  class="form-btn-submit">Next</button>
                                                    <div>`);
            }
          }
        };

        $(document).on("change", "#check-privacy-btn", (e) => {
          const isChecked = $(e.target).is(":checked");
          $("#btn-submit-chat").prop("disabled", !isChecked);
        });

        const getRenderedHTMLWithValues = () => {
          $("#chat-content input").each(function () {
            $(this).attr("value", $(this).val());
          });

          $(
            '#chat-content input[type="radio"], #chat-content input[type="checkbox"]'
          ).each(function () {
            if ($(this).is(":checked")) {
              $(this).attr("checked", "checked");
            } else {
              $(this).removeAttr("checked");
            }
          });

          $("#chat-content select option").each(function () {
            if ($(this).is(":selected")) {
              $(this).attr("selected", "selected");
            } else {
              $(this).removeAttr("selected");
            }
          });

          let content = $("#chat-content").html();
          sessionStorage.setItem("formHtml", content);
        };

        $(document).on("click", "#btn-submit-chat", () => {
          const data = checkingData.reduce((acc, item) => {
            acc[item.name] = item.value;
            return acc;
          }, {});

          if (err.length > 0) {
            data = formValues;
            checkingData = formCheck;
            $(".error-btn-close").closest(".error-msg-pop").fadeOut();
          }

          if (err.length > 0) {
            chatbotData = formValues;
            checkingData = formCheck;
            $(".error-btn-close").closest(".error-msg-pop").fadeOut();
          }

          //add key value pair
          getRenderedHTMLWithValues();

          let isLoad = false;

          if (!isLoad) {
            $(this).prop("disabled", true);
            $("#btn-submit-chat").append(
              '<img src="/assets/img/loader.gif" class="btn-loader" />'
            );
          }

          var formData = new FormData();

          Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value);
          });

          console.table(data);
        });

        $(document).on("click", "#btn-review-data", (e) => {
          scrollToForm(e);
          let formId = $(e.currentTarget).attr("form-id");
          let formSelector = `#chat-form-${formId}`;
          if ($(formSelector).find(".apply-prev-btn").length === 0) {
            $(formSelector).append(
              `<button type="button" class="apply-prev-btn" form-id="${formId}">Modify and preview</button>`
            );
          }
        });

        $(document).on("click", ".apply-prev-btn", (e) => {
          const formId = $(e.currentTarget).attr("form-id");
          const formSelector = `#chat-form-${formId}`;
          if ($(formSelector).find(".apply-prev-btn").length > 0) {
            $(`.apply-prev-btn[form-id="${formId}"]`).remove();
          }
          scrollToBottom(content);
        });
      });

      function convertKana(nameInput, readInput) {
        $(readInput).autoKana(nameInput, readInput, {
          katakana: true,
        });
      }
    })
    .catch((error) => console.error("Failed to load resources", error));
});
