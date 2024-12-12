import streamlit as st
import assemblyai as aai
import os
from datetime import datetime
from dotenv import load_dotenv
import re
from auth import (
    generate_magic_link, verify_magic_link, create_user, 
    get_user, approve_user, update_last_login, 
    list_pending_users, is_admin, send_magic_link
)

# Load environment variables from .env.local
load_dotenv('.env.local')

# Configure AssemblyAI with API key from environment
aai.settings.api_key = os.getenv('ASSEMBLYAI_API_KEY')

# Configure local storage
STORAGE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'storage')
AUDIO_DIR = os.path.join(STORAGE_DIR, 'audio')
TRANSCRIPT_DIR = os.path.join(STORAGE_DIR, 'transcripts')

# Create storage directories if they don't exist
os.makedirs(AUDIO_DIR, exist_ok=True)
os.makedirs(TRANSCRIPT_DIR, exist_ok=True)

# Initialize session state
if 'user' not in st.session_state:
    st.session_state.user = None

def upload_to_s3(file_obj, filename):
    """Upload a file to local storage"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    s3_key = f"{timestamp}_{filename}"
    
    try:
        file_path = os.path.join(AUDIO_DIR, s3_key)
        with open(file_path, 'wb') as f:
            f.write(file_obj.getvalue())
        return file_path
    except Exception as e:
        st.error(f"Error uploading to local storage: {str(e)}")
        return None

def save_uploaded_file(uploaded_file):
    """Save uploaded file to local storage"""
    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{uploaded_file.name}"
        file_path = os.path.join(AUDIO_DIR, filename)
        
        with open(file_path, 'wb') as f:
            f.write(uploaded_file.getvalue())
        return file_path
    except Exception as e:
        st.error(f"Error saving file: {str(e)}")
        return None

def format_text(text):
    """Format text with proper capitalization and punctuation"""
    if not text:
        return ""
        
    # Split into sentences (handling multiple spaces and newlines)
    sentences = re.split(r'([.!?]+)\s*', text)
    
    formatted_sentences = []
    for i in range(0, len(sentences)-1, 2):
        # Get sentence and its punctuation
        sentence = sentences[i].strip()
        punctuation = sentences[i+1] if i+1 < len(sentences) else "."
        
        # Capitalize first letter of sentence
        if sentence:
            sentence = sentence[0].upper() + sentence[1:] if len(sentence) > 1 else sentence.upper()
            formatted_sentences.append(sentence + punctuation)
    
    # Join sentences with proper spacing
    formatted_text = " ".join(formatted_sentences)
    
    # Fix common formatting issues
    formatted_text = re.sub(r'\s+([.,!?])', r'\1', formatted_text)  # Remove spaces before punctuation
    formatted_text = re.sub(r'\s+', ' ', formatted_text)  # Remove multiple spaces
    formatted_text = re.sub(r'\s*\n\s*', '\n', formatted_text)  # Clean up newlines
    
    return formatted_text

def format_transcript(transcript):
    """Format transcript with speaker labels and proper formatting"""
    formatted_parts = []
    current_speaker = None
    
    # Format utterances with speaker labels
    for utterance in transcript.utterances:
        if utterance.speaker != current_speaker:
            formatted_parts.append(f"\nSpeaker {utterance.speaker}:")
            current_speaker = utterance.speaker
        
        # Format the utterance text
        text = format_text(utterance.text)
        formatted_parts.append(text)
    
    # Add chapters if available
    if transcript.chapters:
        formatted_parts.append("\n\nChapter Summary:")
        for i, chapter in enumerate(transcript.chapters, 1):
            formatted_parts.append(f"\nChapter {i}: {format_text(chapter.headline)}")
            formatted_parts.append(format_text(chapter.summary))
    
    return "\n".join(formatted_parts)

def analyze_with_lemur(transcript_text: str, query: str) -> str:
    """Analyze transcript using LeMUR"""
    try:
        lemur = aai.LeMUR()
        response = lemur.analyze(
            transcript_text=transcript_text,
            prompt=query,
            format_text=True
        )
        return response.response
    except Exception as e:
        st.error(f"Error during LeMUR analysis: {str(e)}")
        return None

def get_audio_intelligence(transcript) -> dict:
    """Extract audio intelligence features"""
    intelligence = {
        'sentiment': [],
        'topics': [],
        'summary': '',
        'action_items': []
    }
    
    try:
        # Get sentiment analysis
        if transcript.sentiment_analysis:
            for result in transcript.sentiment_analysis:
                intelligence['sentiment'].append({
                    'text': result.text,
                    'sentiment': result.sentiment,
                    'confidence': result.confidence
                })
        
        # Get topic detection
        if transcript.topics:
            intelligence['topics'] = [
                {'topic': topic.text, 'confidence': topic.confidence}
                for topic in transcript.topics
            ]
        
        # Get auto chapters (summary)
        if transcript.chapters:
            intelligence['summary'] = "\n".join([
                f"• {chapter.headline}: {chapter.summary}"
                for chapter in transcript.chapters
            ])
        
        # Get action items
        if transcript.text:
            intelligence['action_items'] = analyze_with_lemur(
                transcript.text,
                "Extract action items and tasks mentioned in this transcript."
            )
        
        return intelligence
    except Exception as e:
        st.error(f"Error during audio intelligence analysis: {str(e)}")
        return intelligence

def start_realtime_transcription():
    """Initialize real-time transcription"""
    transcriber = aai.RealtimeTranscriber(
        sample_rate=16000,
        word_boost=["SpeechScribe", "transcript"],
        language_code="en"
    )
    
    return transcriber

def handle_realtime_transcript(transcript):
    """Handle real-time transcript updates"""
    if transcript.text:
        st.session_state.realtime_text = transcript.text
        
def transcribe_audio(audio_path, original_filename):
    try:
        # Create a transcriber with formatting options
        transcriber = aai.Transcriber()
        
        # Configure transcription options
        config = aai.TranscriptionConfig(
            punctuate=True,
            format_text=True,
            speaker_labels=True,
            auto_chapters=True,
            sentiment_analysis=True,
            topics=True
        )
        
        # Start the transcription
        transcript = transcriber.transcribe(
            audio_path,
            config=config
        )
        
        # Format the transcript with speaker labels and chapters
        formatted_text = format_transcript(transcript)
        
        # Save transcript to local storage
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        transcript_filename = f"{timestamp}_{os.path.splitext(original_filename)[0]}.txt"
        transcript_path = os.path.join(TRANSCRIPT_DIR, transcript_filename)
        
        with open(transcript_path, 'w', encoding='utf-8') as f:
            f.write(formatted_text)
        
        # Store transcript and intelligence for analysis tab
        st.session_state.last_transcript = formatted_text
        st.session_state.last_intelligence = get_audio_intelligence(transcript)
            
        return {
            'text': formatted_text,
            'transcript_path': transcript_path,
            'chapters': transcript.chapters
        }
        
    except Exception as e:
        st.error(f"Error during transcription: {str(e)}")
        return None

def login_page():
    st.markdown("""
        <div class="centered-header">
            <div class="icon-text">🎙️</div>
            <h1>SpeechScribe</h1>
            <p style='font-size: 1.2rem; color: #666;'>Transform your audio into beautifully formatted transcripts</p>
        </div>
    """, unsafe_allow_html=True)
    
    # Check for magic link verification
    params = st.experimental_get_query_params()
    if 'token' in params:
        token = params[0]
        email = verify_magic_link(token)
        if email:
            user = get_user(email)
            if user and user['status'] == 'approved':
                st.session_state.user = user
                update_last_login(email)
                st.experimental_rerun()
            else:
                st.error("Your account is pending approval.")
        else:
            st.error("Invalid or expired magic link.")
    
    # Login/Registration Form
    with st.form("auth_form"):
        email = st.text_input("Email")
        name = st.text_input("Name (required for new users)")
        submit = st.form_submit_button("Sign In / Register")
        
        if submit and email:
            user = get_user(email)
            if user:
                if user['status'] == 'approved':
                    # Existing approved user
                    token = generate_magic_link(email)
                    send_magic_link(email, token)
                    st.success("Magic link sent! Check your email.")
                else:
                    st.info("Your account is pending approval.")
            else:
                if name:
                    # New user registration
                    create_user(email, name)
                    st.info("Registration successful! Please wait for admin approval.")
                else:
                    st.error("Name is required for new users.")

def admin_page():
    st.title("Admin Dashboard")
    
    pending_users = list_pending_users()
    if pending_users:
        st.subheader("Pending Approvals")
        for user in pending_users:
            col1, col2 = st.columns([3, 1])
            with col1:
                st.write(f"**{user['name']}** ({user['email']})")
                st.write(f"Registered: {user['created_at']}")
            with col2:
                if st.button("Approve", key=f"approve_{user['email']}"):
                    if approve_user(user['email'], st.session_state.user['email']):
                        st.success(f"Approved {user['email']}")
                        st.experimental_rerun()
    else:
        st.info("No pending approvals")

def main_app():
    # Initialize session state for real-time transcription
    if 'realtime_text' not in st.session_state:
        st.session_state.realtime_text = ""
    
    # Streamlit UI
    st.set_page_config(
        page_title="SpeechScribe",
        page_icon="🎙️",
        layout="wide"
    )

    # Custom CSS
    st.markdown("""
        <style>
        .main {
            padding: 2rem;
        }
        .stApp {
            background-color: #f5f7f9;
        }
        .css-1d391kg {
            padding: 2rem 1rem;
        }
        .transcript-box {
            height: 400px;
            overflow-y: auto;
            padding: 1.5rem;
            background-color: white;
            border-radius: 10px;
            border: 1px solid #e0e3e7;
            margin: 1rem 0;
            font-family: 'IBM Plex Sans', sans-serif;
            line-height: 1.6;
        }
        .feature-card {
            background-color: white;
            padding: 1.5rem;
            border-radius: 10px;
            border: 1px solid #e0e3e7;
            margin: 1rem 0;
        }
        .centered-header {
            text-align: center;
            margin-bottom: 2rem;
        }
        .icon-text {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        </style>
    """, unsafe_allow_html=True)

    # Header
    st.markdown("""
        <div class="centered-header">
            <div class="icon-text">🎙️</div>
            <h1>SpeechScribe</h1>
            <p style='font-size: 1.2rem; color: #666;'>Transform your audio into beautifully formatted transcripts</p>
        </div>
    """, unsafe_allow_html=True)

    # Features section
    col1, col2, col3 = st.columns(3)

    with col1:
        st.markdown("""
            <div class="feature-card">
                <h3>✨ Smart Formatting</h3>
                <p>Automatic punctuation, capitalization, and paragraph breaks for maximum readability.</p>
            </div>
        """, unsafe_allow_html=True)

    with col2:
        st.markdown("""
            <div class="feature-card">
                <h3>👥 Speaker Detection</h3>
                <p>Automatically identifies and labels different speakers in your audio.</p>
            </div>
        """, unsafe_allow_html=True)

    with col3:
        st.markdown("""
            <div class="feature-card">
                <h3>📑 Chapter Summary</h3>
                <p>AI-powered chapter generation for longer recordings.</p>
            </div>
        """, unsafe_allow_html=True)

    st.markdown("---")

    # Add tabs for different features
    tabs = st.tabs(["File Upload", "Real-time Recording", "Analysis"])
    
    with tabs[0]:
        # Existing file upload code
        st.subheader("Upload Your Audio")
        st.markdown("Supported formats: MP3, WAV, M4A, and more.")

        uploaded_file = st.file_uploader("Choose an audio file", type=["mp3", "wav", "m4a", "ogg", "wma", "aac"])

        if uploaded_file is not None:
            audio_file = uploaded_file
            
            if st.button("Transcribe Audio", type="primary"):
                temp_audio_path = save_uploaded_file(audio_file)
                
                if temp_audio_path:
                    try:
                        # Create a progress placeholder
                        progress_placeholder = st.empty()
                        status_placeholder = st.empty()
                        progress_bar = progress_placeholder.progress(0)
                        
                        # Update status for file processing
                        status_placeholder.info("Processing audio file...")
                        progress_bar.progress(25)
                        
                        # Get the transcription
                        status_placeholder.info("Transcribing audio... This may take a few minutes...")
                        progress_bar.progress(50)
                        
                        result = transcribe_audio(temp_audio_path, audio_file.name)
                        progress_bar.progress(75)
                        
                        # Clear progress indicators
                        progress_placeholder.empty()
                        status_placeholder.empty()
                        
                        # Display success message
                        st.success("Transcription completed!")
                        
                        # Display the results in a scrollable box
                        st.subheader("Transcription Results")
                        st.markdown('<div class="transcript-box">' + result['text'].replace('\n', '<br>') + '</div>', 
                                  unsafe_allow_html=True)
                        
                        if result['transcript_path']:
                            st.success(f"Transcript saved locally")
                        
                        # Add a download button for the transcription
                        st.download_button(
                            label="💾 Download Full Transcription",
                            data=result['text'],
                            file_name=f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{os.path.splitext(audio_file.name)[0]}.txt",
                            mime="text/plain",
                        )
                        
                    finally:
                        # Clean up temporary file
                        os.unlink(temp_audio_path)
        else:
            st.info("👆 Upload an audio file to get started!")

    with tabs[1]:
        st.subheader("Real-time Transcription")
        st.write("Transcribe audio in real-time using your microphone")
        
        col1, col2 = st.columns(2)
        with col1:
            if st.button("🎙️ Start Recording", key="start_recording"):
                transcriber = start_realtime_transcription()
                transcriber.on_transcript(handle_realtime_transcript)
                st.session_state.transcriber = transcriber
                st.success("Recording started! Speak into your microphone.")
        
        with col2:
            if st.button("⏹️ Stop Recording", key="stop_recording"):
                if hasattr(st.session_state, 'transcriber'):
                    st.session_state.transcriber.close()
                    del st.session_state.transcriber
                st.info("Recording stopped.")
        
        # Display real-time transcript
        st.markdown("""
            <div class="transcript-box" style="background-color: #f8f9fa;">
                <h4>Real-time Transcript</h4>
                <p>{}</p>
            </div>
        """.format(st.session_state.realtime_text), unsafe_allow_html=True)
    
    with tabs[2]:
        st.subheader("Advanced Analysis")
        
        if 'last_transcript' in st.session_state:
            # LeMUR Analysis
            st.write("### 🤖 LeMUR Analysis")
            query = st.text_input("Ask a question about the transcript:", 
                                placeholder="e.g., What are the main points discussed?")
            
            if query and st.button("Analyze"):
                with st.spinner("Analyzing with LeMUR..."):
                    analysis = analyze_with_lemur(st.session_state.last_transcript, query)
                    if analysis:
                        st.write(analysis)
            
            # Audio Intelligence
            st.write("### 📊 Audio Intelligence")
            
            if 'last_intelligence' in st.session_state:
                intel = st.session_state.last_intelligence
                
                # Sentiment Analysis
                if intel['sentiment']:
                    st.write("#### Sentiment Analysis")
                    for sent in intel['sentiment']:
                        sentiment_color = {
                            'POSITIVE': '🟢',
                            'NEGATIVE': '🔴',
                            'NEUTRAL': '⚪'
                        }.get(sent['sentiment'], '⚪')
                        st.write(f"{sentiment_color} {sent['text']}")
                
                # Topics
                if intel['topics']:
                    st.write("#### Topics Detected")
                    topics_html = ["<div style='display: inline-block; padding: 5px 10px; margin: 5px; background-color: #e9ecef; border-radius: 15px;'>"]
                    for topic in intel['topics']:
                        topics_html.append(f"🏷️ {topic['topic']}")
                    topics_html.append("</div>")
                    st.markdown(" ".join(topics_html), unsafe_allow_html=True)
                
                # Summary
                if intel['summary']:
                    st.write("#### Chapter Summary")
                    st.write(intel['summary'])
                
                # Action Items
                if intel['action_items']:
                    st.write("#### Action Items")
                    st.write(intel['action_items'])
        else:
            st.info("Upload or record audio to see advanced analysis.")

    # Footer
    st.markdown("---")
    st.markdown("""
        <div style='text-align: center; color: #666; padding: 2rem;'>
            <p>Powered by AssemblyAI 🚀</p>
            <p style='font-size: 0.8rem;'>Built with Streamlit and ❤️</p>
        </div>
    """, unsafe_allow_html=True)

# Main routing
if st.session_state.user:
    if is_admin(st.session_state.user['email']):
        tabs = st.tabs(["Transcription", "Admin"])
        with tabs[0]:
            main_app()
        with tabs[1]:
            admin_page()
    else:
        main_app()
        
    # Logout button in sidebar
    if st.sidebar.button("Logout"):
        st.session_state.user = None
        st.experimental_rerun()
else:
    login_page()
