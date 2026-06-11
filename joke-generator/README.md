# Random Joke Generator

A fun and interactive web application that fetches random jokes from multiple external APIs and allows you to save your favorites!

## Features

### Multiple Joke Sources
- **Official Joke API** - Classic setup/punchline jokes
- **JokeAPI** - Programming, Knock-Knock, and random jokes
- **Dad Jokes API** - Classic dad jokes
- **Random Source** - Mix it up with random selection from all sources

### Joke Categories
- **Random** - Mix from all sources
- **Programming** - Coding and tech-related jokes
- **Dad Jokes** - Classic dad humor
- **Knock-Knock** - Traditional knock-knock jokes

### Features
- **Copy to Clipboard** - Easily copy jokes to share
- **Share** - Native sharing (if supported by browser)
- **Favorites System** - Save your favorite jokes locally
- **Statistics** - Track jokes loaded and favorites count
- **Persistent Storage** - Your favorites are saved in localStorage
- **Dark Mode Ready** - Beautiful dark mode support

### User Experience
- Real-time loading indicators
- Smooth animations and transitions
- Responsive design for mobile and desktop
- Clean, modern UI with Tailwind CSS
- Font Awesome icons for visual appeal

## How to Use

1. **Open the app**: Simply open `index.html` in your browser
2. **Select a joke type**: Choose from Random, Programming, Dad Jokes, or Knock-Knock
3. **Get a joke**: Click the "Get Joke" button
4. **Enjoy the humor**: Read and laugh at the joke!
5. **Save favorites**: Click the heart icon to save jokes you like
6. **Share**: Click share to send the joke to friends
7. **Copy**: Click copy to add the joke to your clipboard

## What You Can Do

- Select Joke Type
  - Random (all sources)
  - Programming (JokeAPI)
  - Dad Jokes (Dad Jokes API)
  - Knock-Knock (JokeAPI)
- Actions
  - Get Joke (fetch new)
  - Share (native or copy)
  - Copy (to clipboard)
  - Favorite (save locally)
- Favorites Management
  - View saved jokes
  - Remove individual jokes
  - Clear all favorites
- Statistics
  - Jokes Loaded Counter
  - Favorites Counter
  - Current Source Display

## External APIs Used

### 1. Official Joke API
- **URL**: `https://official-joke-api.appspot.com/random_joke`
- **Type**: Setup/Punchline jokes
- **Features**: Free, no authentication needed

### 2. JokeAPI
- **URL**: `https://v2.jokeapi.dev/joke/`
- **Categories**: Programming, Knock-Knock, Misc, Dark, Pun, Spooky, etc.
- **Features**: Safe mode available, JSON response

### 3. Dad Jokes API
- **URL**: `https://icanhazdadjoke.com/`
- **Type**: Single-line dad jokes
- **Features**: Simple, fun, classic dad humor

## Technologies

- **HTML5** - Structure
- **CSS3 + Tailwind CSS** - Styling and responsive design
- **JavaScript** - Core functionality
- **Fetch API** - HTTP requests to joke APIs
- **localStorage** - Persistent data storage
- **Font Awesome** - Icons

## Project Structure

```
joke-generator/
├── index.html       # Main HTML file
├── script.js        # JavaScript logic
└── README.md        # This file
```

## Code Highlights

### Fetching from Multiple APIs
```javascript
async function getJoke() {
    switch(jokeType) {
        case 'programming':
            joke = await getJokeAPI('Programming');
            break;
        case 'dad':
            joke = await getDadJoke();
            break;
        // ... more cases
    }
}
```

### Favorites Management
```javascript
function toggleFavorite() {
    // Save/remove from favorites
    const index = favorites.findIndex(fav => fav.text === currentJoke.text);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(currentJoke);
    }
    localStorage.setItem('jokesFavorites', JSON.stringify(favorites));
}
```

### Error Handling
```javascript
try {
    const response = await fetch(url);
    const data = await response.json();
    // Process data
} catch (error) {
    showError('Something went wrong!');
}
```

## API Response Examples

### Official Joke API
```json
{
    "type": "general",
    "setup": "Why did the scarecrow win an award?",
    "punchline": "He was outstanding in his field!",
    "id": 1
}
```

### JokeAPI
```json
{
    "category": "Programming",
    "type": "twopart",
    "setup": "How many programmers does it take to change a light bulb?",
    "delivery": "None, that's a hardware problem!",
    "id": 42
}
```

### Dad Jokes API
```json
{
    "id": "jNFExP",
    "joke": "Why don't scientists trust atoms? Because they make up everything!",
    "status": 200
}
```

## Features to Add

- Export favorites as JSON
- Import favorites from JSON
- Search/filter favorites
- Rate jokes (1-5 stars)
- Email jokes to friends
- Joke history tracking
- Offline support with Service Workers
- Multi-language support
- Audio narration of jokes
- Integration with social media APIs

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Error Handling

The app gracefully handles:
- Network errors
- API failures
- Invalid responses
- No internet connection
- Clipboard access issues

## Data Storage

All data is stored locally in the browser:
- Favorites saved in `localStorage`
- No server-side storage required
- Data persists across browser sessions
- Maximum storage: ~5-10MB (browser dependent)

## Customization

You can easily customize:
- Colors (Tailwind classes)
- API endpoints
- Joke categories
- UI layout
- Storage mechanism
- Animation styles

## License

This project is free to use and modify. The external APIs used are also free and don't require authentication.

## Contributing

Feel free to:
- Add more joke sources
- Improve the UI
- Add new features
- Fix bugs
- Suggest improvements

## Author

Created as a fun demonstration of working with external APIs and building interactive web applications.

---

Happy joking!
