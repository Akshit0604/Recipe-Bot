const setupTextarea = document.getElementById('setup-textarea');
const setuploading = document.getElementById('output-container');
const setupInputContainer = document.getElementById('setup-input-container');
const movieBossText = document.getElementById('movie-boss-text');
const OPENAI_API_KEY0 = process.OPENAI_API_KEY0;
const OPENAI_API_KEY1 = process.OPENAI_API_KEY1;
const OPENAI_API_KEY2 = process.OPENAI_API_KEY2;


const url = "https://api.openai.com/v1/completions";
const url1 = 'https://api.openai.com/v1/images/generations'

// $(window).on('load', function() {
//   $("#loading-container").css('display', 'block');
// });

document.getElementById("send-btn").addEventListener("click", () => {
  debugger; 
  var userInput = $("#setup-textarea").val();
  // $("#loading-container").css('display', 'none');
  $("#output-container").css('animation', 'fadeIn 5s');
  $("#output-container").css('display', 'block');
  movieBossText.innerText = "Ok, just wait a second while I cook something up for you...";
  fetchBotReply(userInput);
});

async function fetchBotReply(userInput) {
  try { 
    const response = await fetchAPI(url, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + OPENAI_API_KEY0
      },
      body: JSON.stringify({
        'model': 'gpt-3.5-turbo-instruct',
        'prompt': `I need a food recipe! It should be ${userInput}.`,
        'max_tokens': 100, // Replace with your desired value
        'temperature': 0.8 // Replace with your desired value
      })
    });

    const data = await response.json();
    console.log(data.choices[0].text);
    setTimeout(function() {
      // movieBossText.innerText = data.choices[0].text;
      fetchSynopsis(userInput);
    }, 1000);
  } catch (error) {
    console.error("Error:", error);   
  }
}

async function fetchSynopsis(outline) {
  try {
    const response = await fetchAPI(url, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + OPENAI_API_KEY1
      },
      body: JSON.stringify({
        'model': 'gpt-3.5-turbo-instruct',
        'prompt':`Give the detailed recipe for ${outline}:
        `,
        'max_tokens': 700
      })
    });

    const data = await response.json();
    const synopsis = data.choices[0].text.trim();
    document.getElementById('output-text').innerText = synopsis;
    fetchTitle(synopsis);
    fetchStars(synopsis);
  } catch (error) {
    console.error("Error:", error);
  }
}

async function fetchTitle(synopsis) {
  try {
    const response = await fetchAPI(url, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + OPENAI_API_KEY2
      },
      body: JSON.stringify({
        'model': 'gpt-3.5-turbo-instruct',
        'prompt': `Give a catchy title for \n\n${synopsis}`,
        'max_tokens': 25,
        'temperature': 0.7
      })
    });

    const data = await response.json();
    const title = data.choices[0].text.trim();
    document.getElementById('output-title').innerText = title;
    fetchImagePrompt(title, synopsis);
  } catch (error) {
    console.error("Error:", error);
  }
}

async function fetchStars(synopsis) {
  try {
    const response = await fetchAPI(url, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + OPENAI_API_KEY1
      },
      body: JSON.stringify({
        'model': 'gpt-3.5-turbo-instruct',
        'prompt': `
          which region did this dish originate in?
          ###
          recipe: ${synopsis}  
        `,
        'max_tokens': 100
      })
    });

    const data = await response.json();
    const extractedText = data.choices[0].text.trim();
    //const ingredients = extractedText.replace('ingredients:', '').trim();
    //document.getElementById('output-stars').innerText = `Key Ingredients: ${ingredients}`;
    document.getElementById('output-stars').innerText = `Origin: ${extractedText}`;
  } catch (error) {
    console.error("Error:", error);
  }
}

async function fetchImagePrompt(title, synopsis) {
  try {
    const response = await fetchAPI(url, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + OPENAI_API_KEY0
      },
      body: JSON.stringify({
        'model': 'gpt-3.5-turbo-instruct',
        'prompt': `Describe an image that showcases the final dish of this recipe: ${title}\n\n${synopsis}
        `,
        'temperature': 0.8,
        'max_tokens': 100
      })
    });

    const data = await response.json();
    const imagePrompt = data.choices[0].text.trim();
    fetchImageUrl(imagePrompt);
  } catch (error) {
    console.error("Error:", error);
  }
}

async function fetchImageUrl(imagePrompt){
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY0}`
    },
    body: JSON.stringify({
      prompt:`${imagePrompt}. There should be no text in this image.`,
      n: 1,
      size: '512x512',
      response_format: 'b64_json'
    })
  };
  fetch(url1, requestOptions)
  .then(response => response.json())
  .then(data => {
    if (data.data && data.data.length > 0) {
      document.getElementById('output-img-container').innerHTML = `<img src="data:image/png;base64,${data.data[0].b64_json}">`;
    }
    setupInputContainer.innerHTML = `<button id="view-pitch-btn" class="view-pitch-btn">View Pitch</button>`
    document.getElementById('view-pitch-btn').addEventListener('click', ()=>{
    document.getElementById('setup-container').style.display = 'none'
    document.getElementById('output-container').style.display = 'flex'
    //document.getElementById('output-container') = `This recipe is so good, it's making me hungry! You have a talent for cooking. Bon appétit! 🍽️`
  })
  })
}

// Helper function to handle fetch and rate limits
async function fetchAPI(url, options) {
  const response = await fetch(url, options);
  if (response.status === 429) {
    // Handle rate limit by waiting and retrying the request after a delay
    const retryAfter = parseInt(response.headers.get('Retry-After')) || 1;
    await sleep(retryAfter * 1000);
    return fetchAPI(url, options); // Retry the request
  }
  return response;
}

// Helper function to introduce delay using setTimeout
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


