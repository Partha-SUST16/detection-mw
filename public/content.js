chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener((msg) => {
        console.log("hola");
        if (port.name == "openModal") {
            const existingModal = document.getElementById("dialog");
            try {
                existingModal.showModal();
            } catch (error) {
                console.log("modal isn't closed yet");
                port.postMessage({ val: "previous" , timeStamp: Date.now() });
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

                const button = document.createElement("button");
                button.type = "submit";
                button.title = "Submit";
                button.innerHTML = "Submit";
                button.onclick = function (e) {
                    e.preventDefault();
                    console.log("button clicked");
                    const isYesCheck = document.getElementById("input1");
                    if (isYesCheck.checked) {
                        port.postMessage({ val: isYesCheck.value, timeStamp: Date.now() });
                        isYesCheck.checked = false;
                    } else {
                        const isNoCheck = document.getElementById("input2");
                        port.postMessage({ val: isNoCheck.value, timeStamp: Date.now() });
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
    })
    // if (confirm("Are you wondering?")==true) {
    //     sendResponse("mind-wanderd");
    // } else {
    //     sendResponse("not mind-wandered")
    // }
});
