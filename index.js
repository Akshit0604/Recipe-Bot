const setupTextarea = document.getElementById('setup-textarea');
const setupInputContainer = document.getElementById('setup-input-container');
const recipeBotText = document.getElementById('recipe-bot-text');
const homeButton = document.getElementById('home-btn');

const apiKey = 'sk-proj-YbzeaObPs0kYqJrkCld7T3BlbkFJsznW7rqnqV8IYhUFLBxG';
const url = 'https://api.openai.com/v1/completions';

document.getElementById("send-btn").addEventListener("click", () => {
  if (setupTextarea.value) {
    setupInputContainer.innerHTML = `<img src="loading.gif" class="loading" id="loading">`;
    recipeBotText.innerText = `Ok, just wait a second while I cook up something delicious...`;
    fetchBotReply(setupTextarea.value);
  }
});

function fetchBotReply(prompt) {
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      'model': 'gpt-3.5-turbo-instruct',
      'prompt': `Give me a recipe with the following ingredients: ${prompt}`,
      'max_tokens': 1000
    })
  }).then(response => response.json()).then(data => {
    recipeBotText.innerText = data.choices[0].text.trim();
    setupInputContainer.innerHTML = ''; // Clear loading image after response
  }).catch(error => {
    console.error('Error:', error);
    recipeBotText.innerText = 'Oops! Something went wrong.';
    setupInputContainer.innerHTML = ''; // Clear loading image in case of error
  });
}

// Event listener for the Home button
homeButton.addEventListener("click", () => {
  window.location.href = '/'; // Redirects to the homepage
});
