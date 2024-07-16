const setupTextarea = document.getElementById('setup-textarea');
const setupInputContainer = document.getElementById('setup-input-container');
const recipeBotText = document.getElementById('recipe-bot-text');
const homeButton = document.getElementById('home-btn');
const outputImgContainer = document.getElementById('output-img-container');

// Fetch the configuration file
fetch('config.json')
  .then(response => response.json())
  .then(config => {
    const { openaiApiKey, dalleUrl } = config;

    document.getElementById("send-btn").addEventListener("click", () => {
      if (setupTextarea.value) {
        setupInputContainer.innerHTML = `<img src="loading.gif" class="loading" id="loading">`;
        recipeBotText.innerText = `Ok, just wait a second while I cook up something delicious...`;
        fetchBotReply(setupTextarea.value, openaiApiKey);
      }
    });

    // Function to fetch response from OpenAI GPT-3.5 model
    function fetchBotReply(prompt, apiKey) {
      fetch('https://api.openai.com/v1/completions', {
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
        const recipeText = data.choices[0].text.trim();
        recipeBotText.innerText = recipeText;
        setupInputContainer.innerHTML = ''; // Clear loading image after response

        // Call function to generate image using DALL-E 2 API
        generateRecipeImage(recipeText, dalleUrl);
      }).catch(error => {
        console.error('Error:', error);
        recipeBotText.innerText = 'Oops! Something went wrong.';
        setupInputContainer.innerHTML = ''; // Clear loading image in case of error
      });
    }

    // Function to generate recipe image using DALL-E 2 API
    function generateRecipeImage(recipeText, dalleUrl) {
      fetch(dalleUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any required headers for your DALL-E 2 API authentication
        },
        body: JSON.stringify({
          'text': recipeText,
          'model': 'dall-e-2',
          'max_tokens': 50
        })
      }).then(response => response.json()).then(data => {
        const imageUrl = data.image_url; // Assuming your API returns image URL
        displayRecipeImage(imageUrl);
      }).catch(error => {
        console.error('Error:', error);
        outputImgContainer.innerHTML = 'Failed to generate recipe image.';
      });
    }

    // Function to display recipe image
    function displayRecipeImage(imageUrl) {
      const recipeImage = document.createElement('img');
      recipeImage.src = imageUrl;
      recipeImage.alt = 'Recipe Image';
      recipeImage.classList.add('recipe-image');

      // Clear previous image if exists
      outputImgContainer.innerHTML = '';

      // Append image to output container
      outputImgContainer.appendChild(recipeImage);
    }
  })
  .catch(error => {
    console.error('Error fetching config:', error);
    recipeBotText.innerText = 'Oops! Failed to load configuration.';
  });

// Event listener for the Home button
homeButton.addEventListener("click", () => {
  window.location.href = '/'; // Redirects to the homepage
});
