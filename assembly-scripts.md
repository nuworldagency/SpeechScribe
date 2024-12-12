## Transcribe your first audio file
```
// Start by making sure the `assemblyai` package is installed.
// If not, you can install it by running the following command:
// npm install assemblyai

import { AssemblyAI } from 'assemblyai';

const client = new AssemblyAI({
  apiKey: '8fb5833a3b6b42999c1074dbf8d721bc',
});

const FILE_URL =
  'https://assembly.ai/sports_injuries.mp3';

// You can also transcribe a local file by passing in a file path
// const FILE_URL = './path/to/file.mp3';

// Request parameters 
const data = {
  audio: FILE_URL
}

const run = async () => {
  const transcript = await client.transcripts.transcribe(data);
  console.log(transcript.text);
};

run();
```

## Identify speakers in audio

```
// Start by making sure the `assemblyai` package is installed.
// If not, you can install it by running the following command:
// npm install assemblyai

import { AssemblyAI } from 'assemblyai';

const client = new AssemblyAI({
  apiKey: '8fb5833a3b6b42999c1074dbf8d721bc',
});

const FILE_URL =
  'https://assembly.ai/sports_injuries.mp3';

// You can also transcribe a local file by passing in a file path
// const FILE_URL = './path/to/file.mp3';

// Request parameters where speaker_labels has been enabled
const data = {
  audio: FILE_URL,
  speaker_labels: true
}

const run = async () => {
  const transcript = await client.transcripts.transcribe(data);
  console.log(transcript.text);

  for (let utterance of transcript.utterances) {
    console.log(`Speaker ${utterance.speaker}: ${utterance.text}`);
  }
};

run();

```

## Transcribe using Nano: the cost-effective speech model

```
# Start by making sure the `assemblyai` package is installed.
# If not, you can install it by running the following command:
# pip install -U assemblyai
#
# Note: Some macOS users may need to use `pip3` instead of `pip`.

import assemblyai as aai

# Replace with your API key
aai.settings.api_key = "8fb5833a3b6b42999c1074dbf8d721bc"

# URL of the file to transcribe
FILE_URL = "https://assembly.ai/wildfires.mp3"

# You can also transcribe a local file by passing in a file path
# FILE_URL = './path/to/file.mp3'

# You can change the model by setting the speech_model in the transcription config
config = aai.TranscriptionConfig(speech_model=aai.SpeechModel.nano)

transcriber = aai.Transcriber(config=config)
transcript = transcriber.transcribe(FILE_URL)

if transcript.status == aai.TranscriptStatus.error:
    print(transcript.error)
else:
    print(transcript.text)

```

## Summarize your audio file with an LLM

```
// Start by making sure the `assemblyai` package is installed.
// If not, you can install it by running the following command:
// npm install assemblyai

import { AssemblyAI } from "assemblyai";

const assembly = new AssemblyAI({
  apiKey: '8fb5833a3b6b42999c1074dbf8d721bc',
})

const audioUrl =
  'https://assembly.ai/sports_injuries.mp3'

const run = async () => {
  const transcript = await client.transcripts.transcribe({ audio: audioUrl })

  const prompt = 'Provide a brief summary of the transcript.'

  const { response } = await client.lemur.task({
    transcript_ids: [transcript.id],
    prompt,
    final_model: 'anthropic/claude-3-5-sonnet'
  })

  console.log(response)
}

run()

```

## Transcribe live audio stream

```
// Start by making sure the `assemblyai` package is installed.
// If not, you can install it by running the following command:
// npm install assemblyai

import { AssemblyAI } from "assemblyai";

const assembly = new AssemblyAI({
  apiKey: '8fb5833a3b6b42999c1074dbf8d721bc',
})

const audioUrl =
  'https://assembly.ai/sports_injuries.mp3'

const run = async () => {
  const transcript = await client.transcripts.transcribe({ audio: audioUrl })

  const prompt = 'Provide a brief summary of the transcript.'

  const { response } = await client.lemur.task({
    transcript_ids: [transcript.id],
    prompt,
    final_model: 'anthropic/claude-3-5-sonnet'
  })

  console.log(response)
}

run()

```


