chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener((msg) => {
    console.log("hola" + JSON.stringify(msg));
    if (port.name == "openModal") {
      const existingModal = document.getElementById("dialog");
      try {
        existingModal.showModal();
      } catch (error) {
        console.log("modal isn't closed yet");
        port.postMessage({ val: "previous", timeStamp: msg.timeStamp });
      }

      if (existingModal == null) {
        console.log(`message received: ${msg}`);
        const dialogBox = document.createElement("dialog");
        dialogBox.id = "dialog";

        const form = document.createElement("form");
        form.method = "dialog";

        const text = document.createElement("p");
        text.innerHTML = "Are you mind wondered right now?";
        form.appendChild(text);

        const divElement = document.createElement("div");

        const input1 = document.createElement("input");
        input1.type = "radio";
        input1.id = "input1";
        input1.value = "yes";
        const label = document.createElement("span");
        label.innerHTML = "Yes";
        label.append(input1);
        divElement.appendChild(label);
        divElement.appendChild(document.createElement("br"));

        const input2 = document.createElement("input");
        input2.type = "radio";
        input2.id = "input2";
        input2.value = "no";
        const label1 = document.createElement("span");
        label1.innerHTML = "No";
        label1.appendChild(input2);
        divElement.appendChild(label1);
        divElement.appendChild(document.createElement("br"));
        form.appendChild(divElement);

        input1.onclick = () => {
          document.getElementById("input2").checked = false;
        };
        input2.onclick = () => {
          document.getElementById("input1").checked = false;
        };

        const button = document.createElement("button");
        button.type = "submit";
        button.title = "Submit";
        button.innerHTML = "Submit";
        button.onclick = function (e) {
          e.preventDefault();
          console.log("button clicked");
          const isYesCheck = document.getElementById("input1");
          if (isYesCheck.checked) {
            port.postMessage({
              val: isYesCheck.value,
              timeStamp: msg.timeStamp,
            });
            isYesCheck.checked = false;
          } else {
            const isNoCheck = document.getElementById("input2");
            port.postMessage({
              val: isNoCheck.value,
              timeStamp: msg.timeStamp,
            });
            isNoCheck.checked = false;
          }
          dialogBox.close();
        };
        form.appendChild(button);

        dialogBox.appendChild(form);

        const body = document.getElementsByTagName("body");
        body[0].appendChild(dialogBox);

        dialogBox.showModal();
      }
    }
    if (port.name == "showButton") {
      if (document.getElementById("test") == null) {
        // Create a container for the form
        const formContainer = document.createElement("div");
        formContainer.id = "test";
        formContainer.style.position = "fixed";
        formContainer.style.bottom = "20px";
        formContainer.style.right = "20px";
        formContainer.style.backgroundColor = "white";
        formContainer.style.borderRadius = "10px";
        formContainer.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
        formContainer.style.zIndex = "9999";

        // Create a button element for the form
        const button = document.createElement("button");
        button.innerText = "Click Me\n if you are wandaring!";
        button.style.marginLeft = "auto";
        button.style.marginRight = "auto";
        button.style.display = "block";
        button.style.borderRadius = "inherit";
        button.style.height = "auto";
        button.style.cursor = "pointer";
        button.style.backgroundColor = "lavender";

        // Add event listener for button click
        button.addEventListener("click", () => {
          console.log("Button clicked!");
          port.postMessage({timeStamp: Date.now()});
        });

        // Add the button to the form container
        formContainer.appendChild(button);

        // Add the div to the document
        document.getElementsByTagName("body")[0].appendChild(formContainer);
      }
    }
  });
  // if (confirm("Are you wondering?")==true) {
  //     sendResponse("mind-wanderd");
  // } else {
  //     sendResponse("not mind-wandered")
  // }
});
