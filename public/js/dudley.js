/* Rob O'Leary https://www.roboleary.net/2022/01/13/copy-code-to-clipboard-blog.html */


const copyButtonLabel = "Copy Code";

// use a class selector if available
let blocks = document.querySelectorAll("figure");

blocks.forEach((block) => {
  // only add button if browser supports Clipboard API
  if (navigator.clipboard) {
    let button = document.createElement("button");
    button.classList.add('copy-button');
    button.innerText = copyButtonLabel;
    block.appendChild(button);

    let space = document.createElement("br")
    block.appendChild(space)

    button.addEventListener("click", async () => {
      await copyCode(block, button);
    });
  }
});

async function copyCode(block, button) {
  let code = block.querySelector("code");
  let text = code.innerText;

  await navigator.clipboard.writeText(text);

  // visual feedback that task is completed
  button.innerText = "Code Copied";

  setTimeout(() => {
    button.innerText = copyButtonLabel;
  }, 700);
}

/* Compliments of Claude. Hack to fix whitespace issue with comments in codeblocks */
function removeTrailingWhitespace() {
    const commentElements = document.querySelectorAll('.c1');

    commentElements.forEach(element => {
        let text = element.textContent;
        text = text.replace(/\s+$/, '');
        element.textContent = text;
    });
}

// Call the function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', removeTrailingWhitespace);