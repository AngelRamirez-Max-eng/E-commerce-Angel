// ===== JOKE GENERATOR STATE =====
let currentJoke = null;
let jokeCount = 0;
let jokeType = 'random';
const favorites = JSON.parse(localStorage.getItem('jokesFavorites') || '[]');

// ===== UPDATE FAVORITES COUNT =====
function updateStats() {
    document.getElementById('joke-count').textContent = jokeCount;
    document.getElementById('favorite-count').textContent = favorites.length;
}

// ===== SET JOKE TYPE =====
function setJokeType(type) {
    jokeType = type;
    document.querySelectorAll('.joke-type-btn').forEach(btn => {
        btn.classList.remove('bg-purple-600', 'bg-blue-500', 'bg-green-500', 'bg-orange-500', 'active');
        btn.classList.add('opacity-75');
    });
    event.target.classList.remove('opacity-75');
    event.target.classList.add('active', 'shadow-lg');
    
    document.getElementById('joke-container').innerHTML = `
        <p class="text-gray-600 dark:text-gray-300 text-lg italic">Ready to get a ${type} joke? Click Get Joke!</p>
    `;
}

// ===== FETCH JOKE FROM MULTIPLE SOURCES =====
async function getJoke() {
    const loadingDiv = document.getElementById('loading');
    const jokeContainer = document.getElementById('joke-container');
    
    loadingDiv.classList.remove('hidden');
    jokeContainer.innerHTML = '';

    try {
        let joke = null;

        switch(jokeType) {
            case 'programming':
                joke = await getJokeAPI('Programming');
                document.getElementById('source-name').textContent = 'JokeAPI';
                break;
            case 'dad':
                joke = await getDadJoke();
                document.getElementById('source-name').textContent = 'Dad Jokes API';
                break;
            case 'knock-knock':
                joke = await getJokeAPI('Knock-Knock');
                document.getElementById('source-name').textContent = 'JokeAPI';
                break;
            default: // random
                // Random selection from available sources
                const sources = ['official', 'jokeapi', 'daddad'];
                const randomSource = sources[Math.floor(Math.random() * sources.length)];
                
                if (randomSource === 'official') {
                    joke = await getOfficialJoke();
                    document.getElementById('source-name').textContent = 'Official Joke API';
                } else if (randomSource === 'jokeapi') {
                    joke = await getJokeAPI();
                    document.getElementById('source-name').textContent = 'JokeAPI';
                } else {
                    joke = await getDadJoke();
                    document.getElementById('source-name').textContent = 'Dad Jokes API';
                }
        }

        if (joke) {
            currentJoke = joke;
            jokeCount++;
            displayJoke(joke);
            updateStats();
        } else {
            showError('Failed to fetch joke. Please try again!');
        }
    } catch (error) {
        console.error('Error fetching joke:', error);
        showError('Something went wrong! Please check your internet connection.');
    } finally {
        loadingDiv.classList.add('hidden');
    }
}

// ===== OFFICIAL JOKE API =====
async function getOfficialJoke() {
    try {
        const response = await fetch('https://official-joke-api.appspot.com/random_joke');
        const data = await response.json();
        return {
            text: `${data.setup} - ${data.punchline}`,
            setup: data.setup,
            punchline: data.punchline,
            type: 'joke'
        };
    } catch (error) {
        console.error('Official Joke API error:', error);
        return null;
    }
}

// ===== JOKE API (Multiple Categories) =====
async function getJokeAPI(category = null) {
    try {
        let url = 'https://v2.jokeapi.dev/joke/';
        
        if (category) {
            url += category;
        } else {
            url += 'Any'; // Random category
        }
        
        url += '?safe-mode';

        const response = await fetch(url);
        const data = await response.json();

        if (data.type === 'twopart') {
            return {
                text: `${data.setup} - ${data.delivery}`,
                setup: data.setup,
                punchline: data.delivery,
                type: 'twopart'
            };
        } else {
            return {
                text: data.joke,
                type: 'single'
            };
        }
    } catch (error) {
        console.error('JokeAPI error:', error);
        return null;
    }
}

// ===== DAD JOKES API =====
async function getDadJoke() {
    try {
        const response = await fetch('https://icanhazdadjoke.com/', {
            headers: { 'Accept': 'application/json' }
        });
        const data = await response.json();
        return {
            text: data.joke,
            type: 'dad'
        };
    } catch (error) {
        console.error('Dad Jokes API error:', error);
        return null;
    }
}

// ===== DISPLAY JOKE =====
function displayJoke(joke) {
    const jokeContainer = document.getElementById('joke-container');
    const isFavorite = favorites.some(fav => fav.text === joke.text);
    
    if (joke.type === 'twopart' || joke.setup) {
        jokeContainer.innerHTML = `
            <div class="text-left">
                <p class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Setup:</p>
                <p class="text-gray-700 dark:text-gray-200 mb-6 text-lg">${joke.setup}</p>
                <p class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Punchline:</p>
                <p class="text-purple-600 dark:text-purple-400 text-xl font-bold">${joke.punchline}</p>
            </div>
        `;
    } else {
        jokeContainer.innerHTML = `
            <p class="text-xl text-gray-800 dark:text-white leading-relaxed">${joke.text}</p>
        `;
    }
    
    // Update favorite icon
    const favoriteIcon = document.getElementById('favorite-icon');
    if (isFavorite) {
        favoriteIcon.classList.add('fas');
        favoriteIcon.classList.remove('far');
    } else {
        favoriteIcon.classList.add('far');
        favoriteIcon.classList.remove('fas');
    }
}

// ===== SHOW ERROR =====
function showError(message) {
    const jokeContainer = document.getElementById('joke-container');
    jokeContainer.innerHTML = `
        <div class="text-center">
            <i class="fas fa-exclamation-circle text-4xl text-red-500 mb-4"></i>
            <p class="text-red-600 dark:text-red-400 text-lg font-semibold">${message}</p>
        </div>
    `;
}

// ===== COPY TO CLIPBOARD =====
function copyToClipboard() {
    if (!currentJoke) {
        alert('No joke to copy!');
        return;
    }
    
    navigator.clipboard.writeText(currentJoke.text).then(() => {
        const btn = event.target.closest('button');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        btn.classList.add('bg-green-500', 'hover:bg-green-600');
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.remove('bg-green-500', 'hover:bg-green-600');
        }, 2000);
    }).catch(() => {
        alert('Failed to copy to clipboard!');
    });
}

// ===== SHARE JOKE =====
function shareJoke() {
    if (!currentJoke) {
        alert('No joke to share!');
        return;
    }

    const text = `Check out this joke: ${currentJoke.text}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Funny Joke',
            text: text
        }).catch(err => console.log('Share failed:', err));
    } else {
        // Fallback: Copy to clipboard and show message
        copyToClipboard();
        alert('Joke copied! Share it wherever you want.');
    }
}

// ===== TOGGLE FAVORITE =====
function toggleFavorite() {
    if (!currentJoke) {
        alert('Get a joke first!');
        return;
    }

    const index = favorites.findIndex(fav => fav.text === currentJoke.text);
    
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push({
            text: currentJoke.text,
            type: jokeType,
            addedAt: new Date().toLocaleString()
        });
    }
    
    localStorage.setItem('jokesFavorites', JSON.stringify(favorites));
    updateStats();
    updateFavoritesList();
    displayJoke(currentJoke);
}

// ===== UPDATE FAVORITES LIST =====
function updateFavoritesList() {
    const favoritesList = document.getElementById('favorites-list');
    
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center italic">No favorites yet</p>';
        return;
    }
    
    favoritesList.innerHTML = favorites.map((joke, index) => `
        <div class="bg-white dark:bg-gray-600 p-3 mb-2 rounded border-l-4 border-red-500">
            <p class="text-sm text-gray-700 dark:text-gray-200 mb-2">${joke.text.substring(0, 100)}...</p>
            <div class="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                <span>${joke.type}</span>
                <button onclick="removeFavorite(${index})" class="text-red-500 hover:text-red-700 transition">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        </div>
    `).join('');
}

// ===== REMOVE FAVORITE =====
function removeFavorite(index) {
    favorites.splice(index, 1);
    localStorage.setItem('jokesFavorites', JSON.stringify(favorites));
    updateStats();
    updateFavoritesList();
}

// ===== CLEAR ALL FAVORITES =====
function clearFavorites() {
    if (favorites.length === 0) {
        alert('No favorites to clear!');
        return;
    }
    
    if (confirm('Are you sure you want to clear all favorite jokes?')) {
        favorites.length = 0;
        localStorage.setItem('jokesFavorites', JSON.stringify(favorites));
        updateStats();
        updateFavoritesList();
    }
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    updateStats();
    updateFavoritesList();
});