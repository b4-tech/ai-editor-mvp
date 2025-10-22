# Victory Lap - AI Treatment Writer

An AI-powered treatment writer that helps commercial directors quickly generate polished and brand-aligned treatments.

## Features

### Core Treatment Generation
- ✅ Chapterized treatments with default chapters (INTRO, APPROACH, TONE, CASTING, PERFORMANCE, CAMERA, LOOK & FEEL, EDIT, MUSIC, SOUND, SCRIPTS, CONCLUSION)
- ✅ **Custom chapters** - add, remove, rename, and **reorder with drag & drop or buttons**
- ✅ Style emulation - paste writing samples to match your voice
- ✅ Tone of voice selector (DIRECT, CONVERSATIONAL, FUNNY, POETIC)
- ✅ Genre channel selector (CARS, TECH, SPORTS, FASHION, BEAUTY, etc.)
- ✅ Multi-source input (creative briefs, director's notes, chemistry call notes)

### Control & Editing
- ✅ Word count controls per chapter
- ✅ Toplines mode - condensed 25% version
- ✅ Section-specific regeneration
- ✅ Smart editing (Shorten, Expand, Tighten)
- ✅ Natural language filter - removes AI-typical phrases
- ✅ Version history with change tracking

### Extended Creative Features
- ✅ Script ideas & alternate scenes
- ✅ Character biographies
- ✅ Film/TV/Commercial references
- ✅ Bonus outputs (playlists, watchlists, mood boards)
- ✅ Creative toggles (Tighten, Quips, Curveball modes)
- ✅ Director's reel integration (Vimeo/YouTube links)
- ✅ Alternative chapter titles

### Platform Features
- ✅ Export to PDF, DOCX, or Markdown
- ✅ Auto-save every 30 seconds
- ✅ Desktop-optimized responsive design
- ✅ LocalStorage persistence
- ✅ Multiple treatment management

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **Editor**: Editor.js for rich text editing
- **AI**: OpenAI GPT-4 API (direct browser calls)
- **State Management**: Zustand
- **Export**: jsPDF, docx, file-saver

## Getting Started

### Prerequisites

- Node.js 18+ installed
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-editor-mvp
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

5. When prompted, enter your OpenAI API key (stored locally in your browser)

### Building for Production

```bash
npm run build
```

The production build will be in the `dist/` folder.

## Usage

### Creating Your First Treatment

1. Click "New Treatment" and give it a title
2. Configure your settings in the right panel:
   - Select tone (Direct, Conversational, Funny, or Poetic)
   - Choose genre/channel
   - Optionally paste style samples
3. Add your creative brief and director's notes
4. Click "Generate" on any chapter to create AI-powered content
5. Edit and refine using the built-in editor
6. Export as PDF, DOCX, or Markdown when complete

### Advanced Features

- **Style Emulation**: Paste samples of your writing to match your voice
- **Smart Editing**: Select text and use Shorten/Expand/Tighten buttons
- **Creative Modes**: Enable Tighten, Quips, or Curveball for different writing styles
- **Extended Features**: Generate character bios, references, script ideas, and bonus content
- **Version History**: Save versions and compare changes between drafts

## Project Structure

```
src/
├── components/
│   ├── editor/          # Editor.js integration
│   ├── treatment/       # Treatment management UI
│   └── ui/             # shadcn/ui components
├── lib/
│   ├── openai.ts       # OpenAI API client
│   ├── treatmentGenerator.ts  # AI generation logic
│   ├── prompts.ts      # Prompt templates
│   ├── naturalLanguageFilter.ts  # Text processing
│   ├── export.ts       # PDF/DOCX/MD export
│   └── utils.ts        # Utilities
├── store/
│   └── treatmentStore.ts  # Zustand state management
└── types/
    └── treatment.ts    # TypeScript interfaces
```

## Environment Variables

All configuration is done through the UI. Your OpenAI API key is stored in localStorage and never leaves your browser.

## Security Notes

- API keys are stored in browser localStorage only
- All OpenAI API calls are made directly from the browser
- No backend server - all data stays local
- Clear your browser data to remove stored treatments and API keys

## Future Roadmap (Phase 2)

- Advanced editor with comments and track changes
- Live chat support integration
- Multi-user collaboration (requires backend)
- Mobile native app
- Premium human writer intervention service
- Payment/subscription integration

## License

[Add your license here]

## Support

For issues or questions, please [open an issue](https://github.com/your-repo/issues) on GitHub.
