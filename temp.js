
        // DOM Elements
        const webcam = document.getElementById('webcam');
        const imagePreview = document.getElementById('image-preview');
        const viewportContainer = document.getElementById('viewport-container');
        const viewportPlaceholder = document.getElementById('viewport-placeholder');
        const scanner = document.getElementById('scanner');
        const darkAlert = document.getElementById('dark-alert');
        const narratorOutput = document.getElementById('narrator-output');
        const waveAnim = document.getElementById('wave-anim');
        const screamerBox = document.getElementById('screamer-box');
        const assistantVisualizer = document.getElementById('assistant-visualizer');
        const activeLanguageBadge = document.getElementById('active-language-badge');
        
        // Badges
        const badgeScan = document.getElementById('badge-scan');
        const badgeLight = document.getElementById('badge-light');
        const badgeGpsDest = document.getElementById('badge-gps-dest');
        const badgeDb = document.getElementById('badge-db');
        const dbValueText = document.getElementById('db-value');
        const dbWarningAlert = document.getElementById('db-warning-alert');
        const blipsHolder = document.getElementById('radar-blips-holder');
        
        // Voice Navigation elements
        const micStatusOrb = document.getElementById('mic-status-orb');
        const transcriptDisplay = document.getElementById('transcript-display');
        const directionsContainer = document.getElementById('directions-container');
        
        // Context Variables
        let videoStream = null;
        let audioContext = null;
        let analyser = null;
        let microphoneStream = null;
        
        let isAutoscanActive = false;
        let isVoiceRecogActive = true; 
        let isMicAlarmActive = true;  
        let isScanLoopRunning = false;
        let isRecognitionRunning = false;
        let noSpeechCount = 0;
        let isDangerActive = false;
        let dangerInterval = null;
        let dangerDetails = null;
        
        let speechSynth = window.speechSynthesis;
        let currentUtterance = null;
        let currentTextToRead = "";
        let recognitionEngine = null;
        let speakInProgress = false;
        let currentSpeechPriority = 0; // 0 = normal scan description, 1 = high priority warning (alert, horn)

        // Languages list - 30 languages
        const supportedLanguages = {
            "english": { code: "en-US", name: "English" },
            "hindi": { code: "hi-IN", name: "Hindi" },
            "tamil": { code: "ta-IN", name: "Tamil" },
            "telugu": { code: "te-IN", name: "Telugu" },
            "kannada": { code: "kn-IN", name: "Kannada" },
            "malayalam": { code: "ml-IN", name: "Malayalam" },
            "bengali": { code: "bn-IN", name: "Bengali" },
            "marathi": { code: "mr-IN", name: "Marathi" },
            "gujarati": { code: "gu-IN", name: "Gujarati" },
            "punjabi": { code: "pa-IN", name: "Punjabi" },
            "odia": { code: "or-IN", name: "Odia" },
            "assamese": { code: "as-IN", name: "Assamese" },
            "urdu": { code: "ur-IN", name: "Urdu" },
            "sanskrit": { code: "sa-IN", name: "Sanskrit" },
            "kashmiri": { code: "ks-IN", name: "Kashmiri" },
            "sindhi": { code: "sd-IN", name: "Sindhi" },
            "konkani": { code: "kok-IN", name: "Konkani" },
            "manipuri": { code: "mni-IN", name: "Manipuri" },
            "nepali": { code: "ne-NP", name: "Nepali" },
            "bodo": { code: "brx-IN", name: "Bodo" },
            "dogri": { code: "doi-IN", name: "Dogri" },
            "maithili": { code: "mai-IN", name: "Maithili" },
            "santali": { code: "sat-IN", name: "Santali" },
            "spanish": { code: "es-ES", name: "Spanish" },
            "french": { code: "fr-FR", name: "French" },
            "arabic": { code: "ar-XA", name: "Arabic" },
            "chinese": { code: "zh-CN", name: "Chinese" },
            "japanese": { code: "ja-JP", name: "Japanese" },
            "german": { code: "de-DE", name: "German" },
            "portuguese": { code: "pt-PT", name: "Portuguese" }
        };

        let selectedLanguageKey = "english";
        let onboardingStep = "greeting"; 

        // Local translation templates for system warnings to prevent language mixing
        const translations = {
            "english": {
                welcome: "Welcome to VisionAid. I am Liki, your navigation assistant. Please say your preferred language.",
                language_listed: "Supported options are English, Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Urdu, French, Spanish, Japanese.",
                confirmed: "English language selected. Say Hey Liki to start scanning.",
                scanning: "Scanning...",
                horn: "Warning. Sudden loud noise nearby.",
                route_calc: "Calculating voice route to ",
                route_start: "Route found. Starting turn-by-turn guidance.",
                stop: "System paused. Real-time scanning and directions deactivated.",
                caution: "Caution!",
                detected: "detected!",
                footsteps_alert: "Caution! Movement detected behind you! Someone may be approaching."
            },
            "hindi": {
                welcome: "विजन एड में स्वागत है। मैं लीकी हूँ, आपकी नेविगेशन सहायक। कृपया अपनी पसंदीदा भाषा बोलें।",
                language_listed: "समर्थित विकल्प हैं अंग्रेजी, हिंदी, तमिल, तेलुगु, कन्नड़, मलयालम, बंगाली, मराठी, गुजराती, पंजाबी, उर्दू।",
                confirmed: "हिंदी भाषा चुनी गई है। स्कैनिंग शुरू करने के लिए बोलें हे लीकी।",
                scanning: "स्कैनिंग जारी है...",
                horn: "चेतावनी। पास में अचानक तेज आवाज हुई।",
                route_calc: "का मार्ग खोजा जा रहा है ",
                route_start: "मार्ग मिल गया है। दिशा निर्देश शुरू किए जा रहे हैं।",
                stop: "प्रणाली रोक दी गई है। स्कैनिंग और दिशा निर्देश बंद हैं।",
                caution: "सावधान!",
                detected: "का पता चला है!",
                footsteps_alert: "सावधान! आपके पीछे कुछ हलचल है! कोई आ रहा हो सकता है।"
            },
            "tamil": {
                welcome: "விஷன் எய்ட் உங்களை வரவேற்கிறது. நான் லிகி, உங்கள் வழிசெலுத்தல் உதவியாளர். தயவுசெய்து உங்கள் விருப்பமான மொழியைக் கூறுங்கள்.",
                language_listed: "ஆங்கிலம், தமிழ், தெலுங்கு, கன்னடம், மலையாளம், இந்தி ஆகியவை ஆதரிக்கப்படும் மொழிகள்.",
                confirmed: "தமிழ் மொழி தேர்ந்தெடுக்கப்பட்டது. ஸ்கேனிங்கைத் தொடங்க ஹே லிகி என்று சொல்லுங்கள்.",
                scanning: "ஸ்கேன் செய்யப்படுகிறது...",
                horn: "எச்சரிக்கை. அருகில் திடீரென உரத்த சத்தம் கேட்டது.",
                route_calc: "வழித்தடம் கணக்கிடப்படுகிறது ",
                route_start: "வழித்தடம் கண்டறியப்பட்டது. வழிகாட்டுதல் தொடங்குகிறது.",
                stop: "அமைப்பு நிறுத்தப்பட்டது. ஸ்கேனிங் மற்றும் வழிகாட்டுதல் முடக்கப்பட்டது.",
                caution: "எச்சரிக்கை!",
                detected: "கண்டறியப்பட்டது!",
                footsteps_alert: "எச்சரிக்கை! உங்கள் பின்னால் அசைவு கண்டறியப்பட்டது!"
            },
            "telugu": {
                welcome: "విజన్ ఎయిడ్‌కు స్వాగతం. నేను లికి, మీ నావిగేషన్ అసిస్టెంట్. దయచేసి మీకు నచ్చిన భాషను చెప్పండి.",
                language_listed: "సహాయక భాషలు ఇంగ్లీష్, హిందీ, తెలుగు, తమిళం, కన్నడ, మలయాళం.",
                confirmed: "తెలుగు భాష ఎంపిక చేయబడింది. స్కాన్ ప్రారంభించడానికి హే లికి అని చెప్పండి.",
                scanning: "స్కాన్ అవుతోంది...",
                horn: "హెచ్చరిక. దగ్గరలో హఠాత్తుగా పెద్ద శబ్దం వచ్చింది.",
                route_calc: "మార్గం లెక్కిస్తోంది ",
                route_start: "మార్గం కనుగొనబడింది. నావిగేషన్ ప్రారంభమవుతోంది.",
                stop: "సిస్టమ్ ఆపివేయబడింది. స్కాన్ మరియు నావిగేషన్ నిలిపివేయబడింది.",
                caution: "జాగ్రత్త!",
                detected: "గుర్తించబడింది!",
                footsteps_alert: "జాగ్రత్త! మీ వెనుక కదలిక గుర్తించబడింది!"
            },
            "kannada": {
                welcome: "ವಿಷನ್ ಏಡ್ ಗೆ ಸುಸ್ವಾಗತ. ನಾನು ಲಿಖಿ, ನಿಮ್ಮ ನ್ಯಾವಿಗೇಶನ್ ಅಸಿಸ್ಟೆಂಟ್. ದಯವಿಟ್ಟು ನಿಮ್ಮಿಷ್ಟದ ಭಾಷೆಯನ್ನು ತಿಳಿಸಿ.",
                language_listed: "ಇಂಗ್ಲಿಷ್, ಹಿಂದಿ, ಕನ್ನಡ, ತಮಿಳು, ತೆಲುಗು, ಮಲಯಾಳಂ ಭಾಷೆಗಳು ಲಭ್ಯವಿದೆ.",
                confirmed: "ಕನ್ನಡ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ. ಸ್ಕ್ಯಾನಿಂಗ್ ಪ್ರಾರಂಭಿಸಲು ಹೇ ಲಿಖಿ ಎಂದು ಹೇಳಿ.",
                scanning: "ಸ್ಕ್ಯಾನ್ ಆಗುತ್ತಿದೆ...",
                horn: "ಎಚ್ಚರಿಕೆ. ಹತ್ತಿರದಲ್ಲಿ ಜೋರಾದ ಸದ್ದು ಕೇಳಿಸಿದೆ.",
                route_calc: "ಮಾರ್ಗವನ್ನು ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತಿದೆ ",
                route_start: "ಮಾರ್ಗ ಪತ್ತೆಯಾಗಿದೆ. ಮಾರ್ಗದರ್ಶನ ಪ್ರಾರಂಭವಾಗುತ್ತಿದೆ.",
                stop: "ಸಿಸ್ಟಮ್ ನಿಲ್ಲಿಸಲಾಗಿದೆ. ಸ್ಕ್ಯಾನಿಂಗ್ ಮತ್ತು ಮಾರ್ಗದರ್ಶನವನ್ನು ನಿಲ್ಲಿಸಲಾಗಿದೆ.",
                caution: "ಎಚ್ಚರಿಕೆ!",
                detected: "ಪತ್ತೆಯಾಗಿದೆ!",
                footsteps_alert: "ಎಚ್ಚರ! ನಿಮ್ಮ ಹಿಂದೆ ಚಲನೆ ಪತ್ತೆಯಾಗಿದೆ!"
            },
            "malayalam": {
                welcome: "വിഷൻ എയ്ഡിലേക്ക് സ്വാഗതം. ഞാൻ ലികി, നിങ്ങളുടെ നാവിഗേഷൻ അസിസ്റ്റന്റ്. ദയവായി നിങ്ങളുടെ ഇഷ്ടമുള്ള ഭാഷ പറയുക.",
                language_listed: "ഇംഗ്ലീഷ്, ഹിന്ദി, മലയാളം, തമിഴ്, തെലുങ്ക്, കന്നഡ എന്നിവ ലഭ്യമാണ്.",
                confirmed: "മലയാളം ഭാഷ തിരഞ്ഞെടുത്തിരിക്കുന്നു. സ്കാനിംഗ് തുടങ്ങാൻ ഹേ ലികി എന്ന് പറയുക.",
                scanning: "സ്കാൻ ചെയ്യുന്നു...",
                horn: "മുന്നറിയിപ്പ്. സമീപത്ത് പെട്ടെന്ന് വലിയ ശബ്ദം കേട്ടു.",
                route_calc: "വഴി കണ്ടെത്തുന്നു ",
                route_start: "വഴി കണ്ടെത്തിയിരിക്കുന്നു. നാവിഗേഷൻ ആരംഭിക്കുന്നു.",
                stop: "സിസ്റ്റം നിർത്തിയിരിക്കുന്നു. സ്കാനിംഗും നാവിഗേഷനും നിർത്തി വെച്ചു.",
                caution: "জാഗ്രത!",
                detected: "കണ്ടെത്തി!"
            },
            "bengali": {
                welcome: "ভিশন এইডে স্বাগত। আমি লিকি, আপনার নেভিগেশন সহযোগী। অনুগ্রহ করে আপনার পছন্দের ভাষা বলুন।",
                language_listed: "ইংরেজি, বাংলা, হিন্দি, তামিল, তেলুগু, কন্নড়, মালায়ালম সমর্থित ভাষা।",
                confirmed: "বাংলা ভাষা নির্বাচিত হয়েছে। স্ক্যানিং শুরু করতে বলুন হে লিকি।",
                scanning: "স্ক্যান করা হচ্ছে...",
                horn: "সতর্কতা। কাছেই হঠাৎ জোরে শব্দ শোনা গেছে।",
                route_calc: "পথ খোঁজা হচ্ছে ",
                route_start: "পথ পাওয়া গেছে। দিকনির্দেশনা শুরু হচ্ছে।",
                stop: "সিস্টেম থামানো হয়েছে। স্ক্যানিং এবং নেভিগেশন নিষ্ক্রিয়।",
                caution: "সাবধান!",
                detected: "সনাক্ত করা হয়েছে!"
            },
            "marathi": {
                welcome: "व्हिजनएडमध्ये आपले स्वागत आहे. मी लिकी आहे, तुमची नेव्हिगेशन असिस्टंट. कृपया तुमची आवडती भाषा सांगा.",
                language_listed: "इंग्रजी, हिंदी, मराठी, तमिळ, तेलुगू, कन्नड, मल्याळम, बंगाली.",
                confirmed: "मराठी भाषा निवडली गेली आहे. स्कॅनिंग सुरू करण्यासाठी बोला हे लिकी.",
                scanning: "स्कॅनिंग सुरू आहे...",
                horn: "चेतावणी. जवळच मोठा आवाज झाला.",
                route_calc: "मार्ग शोधत आहे ",
                route_start: "मार्ग सापडला. दिशा निर्देश सुरू करत आहे.",
                stop: "प्रणाली थांबवली आहे.",
                caution: "सावधान!",
                detected: "आढळले!"
            },
            "gujarati": {
                welcome: "વિઝનએડમાં તમારું સ્વાગત છે. હું લીકી છું, તમારી નેવિગેશન આસિસ્ટન્ટ. કૃપા કરીને તમારી મનપસંદ ભાષા કહો.",
                language_listed: "અંગ્રેજી, હિન્દી, ગુજરાતી, તમિલ, તેલુગુ, કન્નડ, મલયાલમ.",
                confirmed: "ગુજરાતી ભાષા પસંદ કરવામાં આવી છે. સ્કેનિંગ શરૂ કરવા માટે બોલો હે લીકી.",
                scanning: "સ્કેનિંગ ચાલુ છે...",
                horn: "ચેતવણી. નજીકમાં મોટો અવાજ થયો.",
                route_calc: "માર્ગ શોધાઈ રહ્યો છે ",
                route_start: "માર્ગ મળી ગયો. દિશા નિર્દેશ શરૂ કરી રહ્યા છીએ.",
                stop: "સિસ્ટમ થોભાવવામાં આવી છે.",
                caution: "સાવધાન!",
                detected: "શોધાયેલ છે!"
            },
            "punjabi": {
                welcome: "ਵਿਜ਼ਨਏਡ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ। ਮੈਂ ਲੀਕੀ ਹਾਂ, ਤੁਹਾਡੀ ਨੇਵੀਗੇਸ਼ਨ ਅਸਿਸਟੈਂਟ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਮਨਪਸੰਦ ਭਾਸ਼ਾ ਦੱਸੋ।",
                language_listed: "ਅੰਗਰੇਜ਼ੀ, ਹਿੰਦੀ, ਪੰਜਾਬੀ, ਤਮਿਲ, ਤੇਲਗੂ, ਕੰਨੜ, ਮਲਿਆਲਮ.",
                confirmed: "ਪੰਜਾਬੀ ਭਾਸ਼ਾ ਚੁਣੀ ਗਈ ਹੈ। ਸਕੈਨਿੰਗ ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਬੋਲੋ ਹੇ ਲੀਕੀ।",
                scanning: "ਸਕੈਨਿੰਗ ਜਾਰੀ ਹੈ...",
                horn: "ਚੇਤਾਵਨੀ। ਨੇੜੇ ਹੀ ਉੱਚਾ ਅਵਾਜ਼ ਹੋਇਆ।",
                route_calc: "ਮਾਰਗ ਲੱਭ ਰਿਹਾ ਹੈ ",
                route_start: "ਮਾਰਗ ਮਿਲ ਗਿਆ ਹੈ। ਦਿਸ਼ਾ ਨਿਰਦੇਸ਼ ਸ਼ੁਰੂ ਕੀਤੇ ਜਾ ਰਹੇ ਹਨ।",
                stop: "ਸਿਸਟਮ ਰੋਕਿਆ ਗਿਆ ਹੈ.",
                caution: "ਸਾਵਧਾਨ!",
                detected: "ਪਾਇਆ ਗਿਆ!"
            },
            "odia": {
                welcome: "ଭିଜନଏଡରେ ଆପଣଙ୍କୁ ସ୍ୱାଗତ। ମୁଁ ଲିକି, ଆପଣଙ୍କ ନେଭିଗେସନ ସହକାରୀ। ଦୟାକରି ଆପଣଙ୍କ ପସନ୍ଦର ଭାଷା କୁହନ୍ତୁ।",
                language_listed: "ଇଂରାଜୀ, ହିନ୍ଦୀ, ଓଡ଼ିଆ, ତାମିଲ, ତେଲୁଗୁ, କନ୍ନଡ଼, ମାଲାୟାଲମ.",
                confirmed: "ଓଡ଼ିଆ ଭାଷା ଚୟନ କରାଯାଇଛି। ସ୍କାନିଂ ଆରମ୍ଭ କରିବାକୁ କୁହନ୍ତୁ ହେ ଲିକି।",
                scanning: "ସ୍କାନିଂ ଚାଲିଛି...",
                horn: "ଚେତାବନୀ। ନିକଟରେ ହଠାତ୍ ଜୋର ଶବ୍ଦ ହେଲା।",
                route_calc: "ମାର୍ଗ ଖୋଜାଯାଉଛି ",
                route_start: "ମାର୍ଗ ମିଳିଗଲା। ଦିଗ ନିର୍ଦ୍ଦେଶ ଆରମ୍ଭ ହେଉଛି।",
                stop: "ସିଷ୍ଟମ ବନ୍ଦ ହୋଇଛି।",
                caution: "ସାବଧାନ!",
                detected: "ଚିହ୍ନଟ ହୋଇଛି!"
            },
            "assamese": {
                welcome: "ভিছনএইডলৈ আপোনাক আদৰণি জনাইছোঁ। মই লিকি, আপোনাৰ নেভিগেশ্যন সহায়ক। অনুগ্ৰহ কৰি আপোনাৰ পছন্দৰ ভাষা কওক।",
                language_listed: "ইংৰাজী, হিন্দী, অসমীয়া, তামিল, তেলুগু, কানাড়া, মালয়ালম.",
                confirmed: "অসমীয়া ভাষা বাছনি কৰা হৈছে। স্কেনিং আৰম্ভ কৰিবলৈ কওক হে লিকি।",
                scanning: "স্কেনিং হৈ আছে...",
                horn: "সাঁৱধান। ওচৰতে হঠাৎ জোৰ শব্দ হৈছে।",
                route_calc: "পথ বিচাৰি থকা হৈছে ",
                route_start: "পথ পোৱা গ'ল। দিশ নিৰ্দেশনা আৰম্ভ কৰা হৈছে।",
                stop: "প্ৰণালী বন্ধ কৰা হৈছে।",
                caution: "সাৱধান!",
                detected: "ধৰা পৰিছে!"
            },
            "urdu": {
                welcome: "ویژن ایڈ میں خوش آمدید۔ میں لیکی ہوں، آپ کی نیویگیشن اسسٹنٹ۔ براہ کرم اپنی پسندیدہ زبان کہیں۔",
                language_listed: "انگریزی، ہندی، اردو، تمل، تلگو، کنڑ، ملیالم.",
                confirmed: "اردو زبان منتخب ہو گئی ہے۔ اسکیننگ شروع کرنے کے لیے بولیں ہے لیکی۔",
                scanning: "اسکیننگ ہو رہی ہے...",
                horn: "خبردار۔ قریب ہی اچانک اونچی آواز ہوئی۔",
                route_calc: "راستہ تلاش کیا جا رہا ہے ",
                route_start: "راستہ مل گیا۔ سمت رہنمائی شروع کی جا رہی ہے۔",
                stop: "سسٹم روک دیا گیا ہے۔",
                caution: "خبردار!",
                detected: "پایا گیا ہے!"
            },
            "sanskrit": {
                welcome: "विजनएड् मध्ये स्वागतम्। अहम् लिकी, तव नेविगेशन सहायिका। कृपया स्वकीयां प्रियां भाषां वदतु।",
                language_listed: "संस्कृतम्, आङ्गलम्, हिन्दी, तमिळ, तेलुगु, कन्नड, मलयाळम्.",
                confirmed: "संस्कृत भाषा चिता। स्कैनिंग् आरब्धुं वदतु हे लिकी।",
                scanning: "स्कैनिंग् प्रचलति...",
                horn: "सावधान। समीपे सहसा उच्चध्वनिः अभवत्।",
                route_calc: "मार्गः अन्विष्यते ",
                route_start: "मार्गः लब्धः। मार्गदर्शनं प्रारभ्यते।",
                stop: "प्रणाली स्थगिता।",
                caution: "सावधानम्!",
                detected: "अधिगतम्!"
            },
            "kashmiri": {
                welcome: "विजनएडस मंज खुशआमदीद। बह छुस लिकी, तुहिनज़ नेविगेशन मददगार। महरबानी करिथ वनेव पनेन ज़बान।",
                language_listed: "कश्मीरी, अंग्रेज़ी, हिन्दी, उर्दू, तमिल, तेलुगु.",
                confirmed: "कश्मीरी ज़बान चुननाव। स्कैनिंग शुरू करन खत्र वनेव हे लिकी।",
                scanning: "स्कैनिंग गछान...",
                horn: "خبردار۔ نزدیک گئی اچانک باڑ آواز۔",
                route_calc: "वाथ तलाश करान ",
                route_start: "वाथ लभ्यव। मार्गदर्शन शुरू गछान।",
                stop: "सिस्टम रोकनाव।",
                caution: "خبردار!",
                detected: "लभ्यव!"
            },
            "sindhi": {
                welcome: "ويزن ايڊ ۾ ڀليڪار. مان ليڪي آهي، توهان جي نيويگيشن اسسٽنٽ. مهرباني ڪري پنهنجي پسند جي ٻولي چئو.",
                language_listed: "سنڌي، انگريزي، هندي، اردو، تمل, تيلگو.",
                confirmed: "سنڌي ٻولي چونڊي وئي آهي. اسڪيننگ شروع ڪرڻ لاءِ چئو هي ليڪي.",
                scanning: "اسڪيننگ جاري آهي...",
                horn: "خبردار. ويجهو ئي اوچتو وڏو آواز ٿيو.",
                route_calc: "رستو ڳوليو پيو وڃي ",
                route_start: "رستو ملي ويو. رخ ڏيکارڻ شروع ڪجي ٿو.",
                stop: "سسٽم روڪيو ويو آهي.",
                caution: "خبردار!",
                detected: "معلوم ٿيو!"
            },
            "konkani": {
                welcome: "व्हिजनएडात तुमचें स्वागत। हांव लिकी, तुमची नेव्हिगेशन सहाय्यक। उपकार करून तुमची आवडती भास सांगा.",
                language_listed: "कोंकणी, इंग्लीश, हिंदी, मराठी, तमिळ, तेलुगू, कन्नड.",
                confirmed: "कोंकणी भास वेचून काडल्या. स्कॅनिंग सुरू करपाक सांगा हे लिकी.",
                scanning: "स्कॅनिंग चालू आसा...",
                horn: "शिटकावणी. लागसारच मोट्यान आवाज जालो.",
                route_calc: "रस्तो सोदता ",
                route_start: "रस्तो मेळ्ळो. मार्गदर्शन सुरू करता.",
                stop: "प्रणाली थांबयल्या.",
                caution: "सावधान!",
                detected: "मेळ्ळां!"
            },
            "manipuri": {
                welcome: "ভিজনএদता তরাম্না ওকচরি। ঐহাক লিকিনি, অদোমগী নেভিগেশন শিন্মী। খঙহৌদনা অদোমগী পামজবা লোন পীবিয়ু।",
                language_listed: "মণিপুরী, ইংরেজি, হিন্দি, বাংলা, অসমীয়া.",
                confirmed: "মণিপুরী লোন খল্লরে। স্কেনিং হৌনবগীদমক চেকশিনবীয়ু হে লিকি হায়বীয়ু।",
                scanning: "স্কেনিং চত্থরি...",
                horn: "চেকশিনবীয়ু। মসিদা নক্না খঙহৌদনা লাউবা মখোল তাখ্রে।",
                route_calc: "লম্বী থীবগী থবক চত্থরি ",
                route_start: "লম্বী ফংলে। লম্বী তাকপগী থবক হৌরে।",
                stop: "সিস্তেম খamলে।",
                caution: "চেকশিনবীয়ু!",
                detected: "থেংনরে!"
            },
            "nepali": {
                welcome: "भिजनएडमा स्वागत छ। म लिकी हुँ, तपाईंको नेभिगेसन सहायक। कृपया आफ्नो मनपर्ने भाषा भन्नुहोस्।",
                language_listed: "नेपाली, अंग्रेजी, हिन्दी, मैथिली, भोजपुरी, कोंकणी.",
                confirmed: "नेपाली भाषा चयन गरिएको छ। स्क्यानिङ सुरु गर्न भन्नुहोस् हे लिकी।",
                scanning: "स्क्यानिङ भइरहेको छ...",
                horn: "चेतावनी। नजिकै अचानक ठूलो आवाज आयो।",
                route_calc: "मार्ग खोजिँदै छ ",
                route_start: "मार्ग भेटियो। दिशा निर्देश सुरु गरिँदै छ।",
                stop: "प्रणाली रोकिएको छ।",
                caution: "सावधान!",
                detected: "फेला पर्यो!"
            },
            "bodo": {
                welcome: "भिजनएड आव बरायबाय। आं लिकि, नोंथांनि नेभिगेसन हेफाजाबगिरि। अननानै नोंथांनि मोजां मोननाय रावखौ बुं।",
                language_listed: "बर', अखा, हिन्दी, इंग्लिश, असमीया, बंगाली.",
                confirmed: "बर' रावखौ सायखनाय जाबाय। स्क्यानिङ जागायनो बुं है लिकि।",
                scanning: "स्क्यानिङ जागायबाय...",
                horn: "सावधान। खाथियावनो हरखाब गोरा सोदोब जाबाय।",
                route_calc: "लामा नायगिरबाय थानाय जाबाय ",
                route_start: "लामा मोनबाय। लामा दिन्थिनो जागायबाय।",
                stop: "सिस्तेमखौ थादनाय जाबाय।",
                caution: "सावधान!",
                detected: "मोननाय जाबाय!"
            },
            "dogri": {
                welcome: "विजनएड च थुआडा स्वागत ऐ। मैं लिकी आं, थुआडी नेविगेशन मददगार। मेहरबानी करी अपणी पसंद दी बोली बोलो।",
                language_listed: "डोगरी, कश्मीरी, हिन्दी, पंजाबी, उर्दू, अंग्रेज़ी.",
                confirmed: "डोगरी बोली चुनी गेदी ऐ। स्कैनिंग शुरू करने लेई बोलो हे लिकी।",
                scanning: "स्कैनिंग होई दी ऐ...",
                horn: "सावधान। कोलै गै अचानक जोर दी अवाज आई।",
                route_calc: "रस्ता लब्भ्या जा करदा ऐ ",
                route_start: "रस्ता लब्भी गेया। मारग दस्सना शुरू कीता जा करदा ऐ।",
                stop: "सिस्टम रोक्या गेदा ऐ।",
                caution: "सावधान!",
                detected: "लभ्या गेदा!"
            },
            "maithili": {
                welcome: "विजनएड में स्वागत अछि। हम लिकी छी, अहाँक नेविगेशन सहायक। कृपया अपन पसंदीदा भाषा बाजू।",
                language_listed: "मैथिली, नेपाली, हिन्दी, बंगाली, भोजपुरी, अंग्रेज़ी.",
                confirmed: "मैथिली भाषा चुनल गेल अछि। स्कैनिंग शुरू करबाक लेल बाजू हे लिकी।",
                scanning: "स्कैनिंग भ रहल अछि...",
                horn: "सजग रहू। कतहु नजदीक में अचानक जोर स अवाज भेल।",
                route_calc: "रस्ता खोजल जा रहल अछि ",
                route_start: "रस्ता भेट गेल। मारग देखाबय के काज शुरू भेल।",
                stop: "सिस्टम रोकल गेल अछि।",
                caution: "सजक रहू!",
                detected: "भेटल अछि!"
            },
            "santali": {
                welcome: "ᱵᱷᱤᱡᱚᱱ ᱮᱰ ᱨᱮ ᱥᱟᱹᱜᱩᱱ ᱫᱟᱨᱟᱢ᱾ ᱧᱩᱛᱩਮ ᱛᱤᱧ ᱞᱤᱠᱤ, ᱟᱢᱟᱜ ᱱᱮᱵᱷᱤᱜᱮᱥᱚᱱ ᱜᱚᱲᱚᱭᱤᱡ᱾ ᱫᱟᱭᱟ ᱠᱟᱛᱮ ᱟᱢᱟᱜ ᱠᱩᱥᱤ ᱨᱚᱲ ᱞᱟᱹᱭਮᱮ।",
                language_listed: "ᱥᱟᱱᱛᱟᱲᱤ, ᱵᱮᱝᱜᱚᱞᱤ, ᱦᱤᱱᱫᱤ, ᱩᱰᱤᱭᱟ, ᱟᱥᱟᱢᱤᱥ.",
                confirmed: "ᱥᱟᱱᱛᱟᱲᱤ ᱨᱚᱲ ᱵᱟᱪᱷᱟᱣ ᱮᱱᱟ᱾ ᱥᱠᱮᱱ ᱮᱦᱚᱵ ᱞᱟᱹᱜᱤᱫ ᱢᱮᱱᱢᱮ ᱦᱮ ᱞᱤᱠᱤ᱾",
                scanning: "ᱥᱠᱮᱱ ᱪᱟᱞᱟᱜ ᱠᱟᱱᱟ...",
                horn: "ᱪᱮᱛᱟᱣᱱᱤ! ᱥᱩᱨ ᱨᱮ ᱦᱚᱴᱟᱛ ᱡᱚᱨ ᱥᱟᱰᱮ ᱦᱩᱭᱮᱱᱟ᱾",
                route_calc: "ᱰᱟᱦᱟᱨ ᱥᱮᱸᱫᱽᱨᱟ ᱦᱩᱭᱩᱜ ᱠᱟᱱᱟ ",
                route_start: "ᱰᱟᱦᱟᱨ ᱧᱟᱢ ᱮᱱᱟ᱾ ᱱᱮᱵᱷᱤᱜᱮᱥᱚᱱ ᱮᱦᱚᱵ ᱮᱱᱟ᱾",
                stop: "ᱥᱤᱥᱴᱮᱢ ᱵᱚᱸᱫᱽ ᱮᱱᱟ।",
                caution: "चेतव!",
                detected: "ᱧᱟམ ᱟᱠᱟᱱᱟ!"
            },
            "spanish": {
                welcome: "Bienvenido a VisionAid. Soy Liki, tu asistente de navegación. Por favor, di tu idioma preferido.",
                language_listed: "Las opciones son español, inglés, francés, portugués, alemán.",
                confirmed: "Idioma español seleccionado. Di Hey Liki para comenzar a escanear.",
                scanning: "Escaneando...",
                horn: "Advertencia. Ruido fuerte repentino cerca.",
                route_calc: "Calculando la ruta de voz a ",
                route_start: "Ruta encontrada. Iniciando guía de voz paso a paso.",
                stop: "Sistema pausado. Escaneo en tiempo real y direcciones desactivadas.",
                caution: "¡Precaución!",
                detected: "detectado!",
                footsteps_alert: "¡Precaución! ¡Movimiento detectado detrás de usted!"
            },
            "french": {
                welcome: "Bienvenue sur VisionAid. Je suis Liki, votre assistante de navigation. Veuillez indiquer votre langue préférée.",
                language_listed: "Les options sont le français, l'anglais, l'espagnol, l'allemand.",
                confirmed: "Langue française sélectionnée. Dites Hey Liki pour commencer le scan.",
                scanning: "Balayage en cours...",
                horn: "Avertissement. Bruit fort soudain à proximité.",
                route_calc: "Calcul de l'itinéraire vocal vers ",
                route_start: "Itinéraire trouvé. Début du guidage vocal étape par étape.",
                stop: "Système en pause. Balayage et guidage désactivés.",
                caution: "Attention !",
                detected: "détecté !",
                footsteps_alert: "Attention ! Mouvement détecté derrière vous !"
            },
            "arabic": {
                welcome: "مرحبًا بك في فيجن إيد. أنا ليكي، مساعدة الملاحة الخاصة بك. يرجى تحديد لغتك المفضلة.",
                language_listed: "الخيارات المتاحة هي العربية، الإنجليزية، الفرنسية، الألمانية.",
                confirmed: "تم اختيار اللغة العربية. قل هي ليكي لبدء المسح الضوئي.",
                scanning: "جاري المسح...",
                horn: "تحذير. ضوضاء عالية مفاجئة بالقرب منك.",
                route_calc: "جاري حساب المسار الصوتي إلى ",
                route_start: "تم العثور على المسار. بدء التوجيه خطوة بخطوة.",
                stop: "تم إيقاف النظام مؤقتًا. تم إلغاء تفعيل المسح والاتجاهات.",
                caution: "تنبيه!",
                detected: "تم رصده!",
                footsteps_alert: "تنبيه! تم رصد حركة خلفك!"
            },
            "chinese": {
                welcome: "欢迎使用 VisionAid。我是 Liki，您的导航助手。请说出您首选的语言。",
                language_listed: "支持的选项有中文、英文、日文、韩文。",
                confirmed: "已选择中文。说“Hey Liki”开始扫描。",
                scanning: "正在扫描...",
                horn: "警告。附近有突然的巨大噪音。",
                route_calc: "正在计算语音路线至 ",
                route_start: "已找到路线。开始逐步语音导航。",
                stop: "系统已暂停。实时扫描和导航已停用。",
                caution: "注意！",
                detected: "已检测到！"
            },
            "japanese": {
                welcome: "VisionAidへようこそ。私はリキ、あなたのナビゲーションアシスタントです。お好みの言語を話してください。",
                language_listed: "選択肢は、日本語、英語、中国語、韓国語です。",
                confirmed: "日本語が選択されました。「ヘイ リキ」と言ってスキャンを開始します。",
                scanning: "スキャン中...",
                horn: "警告。近くで突然大きな音がしました。",
                route_calc: "目的地までのルートを検索しています： ",
                route_start: "ルートが見つかりました。音声案内を開始します。",
                stop: "システムは一時停止されました。スキャンとナビゲーションが停止しました。",
                caution: "注意！",
                detected: "が検出されました！"
            },
            "german": {
                welcome: "Willkommen bei VisionAid. Ich bin Liki, deine Navigationsassistentin. Bitte nenne deine bevorzugte Sprache.",
                language_listed: "Die Optionen sind Deutsch, Englisch, Französisch, Spanisch.",
                confirmed: "Deutsche Sprache ausgewählt. Sage Hey Liki, um den Scan zu starten.",
                scanning: "Scannen...",
                horn: "Warnung. Plötzliches lautes Geräusch in der Nähe.",
                route_calc: "Berechne Sprachroute nach ",
                route_start: "Route gefunden. Starte Turn-by-Turn-Navigation.",
                stop: "System pausiert. Echtzeitschnitt und Richtungen deaktiviert.",
                caution: "Achtung!",
                detected: "erkannt!"
            },
            "portuguese": {
                welcome: "Bem-vindo ao VisionAid. Sou Liki, sua assistente de navegação. Por favor, diga seu idioma preferido.",
                language_listed: "As opções são português, inglês, espanhol, francês.",
                confirmed: "Idioma português selecionado. Diga Hey Liki para começar a escanear.",
                scanning: "Escaneando...",
                horn: "Aviso. Ruído alto repentino nas proximidades.",
                route_calc: "Calculando rota de voz para ",
                route_start: "Rota encontrada. Iniciando navegação passo a passo.",
                stop: "Sistema pausado. Varredura e direções desativadas.",
                caution: "Cuidado!",
                detected: "detectado!"
            }
        };

        // Localized Event Names translation map
        const eventTranslations = {
            "english": { vehicles: "Vehicle", running_people: "Running person", sudden_darkness: "Sudden darkness", rain: "Rain", smoke: "Smoke" },
            "hindi": { vehicles: "वाहन", running_people: "भागता हुआ व्यक्ति", sudden_darkness: "अचानक अंधेरा", rain: "बारिश", smoke: "धुआं" },
            "tamil": { vehicles: "வாகனம்", running_people: "ஓடும் நபர்", sudden_darkness: "திடீர் இருள்", rain: "மழை", smoke: "புகை" },
            "telugu": { vehicles: "వాహనం", running_people: "పరుగెత్తుతున్న వ్యక్తి", sudden_darkness: "అకስಮಾత్తుగా చీకటి", rain: "వర్షం", smoke: "పొగ" },
            "kannada": { vehicles: "ವಾಹನ", running_people: "ಓಡುತ್ತಿರುವ ವ್ಯಕ್ತಿ", sudden_darkness: "ಹಠಾತ್ ಕತ್ತಲು", rain: "ಮಳೆ", smoke: "ಹೊಗೆ" },
            "malayalam": { vehicles: "വാഹനം", running_people: "ഓടുന്ന ആൾ", sudden_darkness: "പെട്ടെന്നുള്ള ഇരുട്ട്", rain: "മഴ", smoke: "പുക" },
            "bengali": { vehicles: "যানবাহন", running_people: "দৌড়ানো व्यक्ति", sudden_darkness: "হঠাৎ অন্ধকার", rain: "বৃষ্টি", smoke: "ধোঁয়া" },
            "marathi": { vehicles: "वाहन", running_people: "पळणारी व्यक्ती", sudden_darkness: "अचानक अंधार", rain: "पाऊस", smoke: "धूर" },
            "gujarati": { vehicles: "વાહન", running_people: "દોડતી વ્યક્તિ", sudden_darkness: "અચાનક અંધારું", rain: "વરસાદ", smoke: "ધૂમ્રપान" },
            "punjabi": { vehicles: "ਵਾਹਨ", running_people: "ਭੱਜਦਾ ਹੋਇਆ ਵਿਅਕती", sudden_darkness: "ਅਚਾਨਕ ਹਨੇਰਾ", rain: "ਮੀਂਹ", smoke: "ਧੂੰਆਂ" },
            "odia": { vehicles: "ଯାନବାହନ", running_people: "ଦୌଡୁଥିବା ବ୍ୟକ୍ତି", sudden_darkness: "ହଠାତ୍ ଅନ୍ଧାର", rain: "ବର୍ଷା", smoke: "ଧୂଆଁ" },
            "assamese": { vehicles: "বাহন", running_people: "দৌৰি থকা মানুহ", sudden_darkness: "হঠাৎ অন্ধকাৰ", rain: "বৰষুণ", smoke: "ধোঁৱা" },
            "urdu": { vehicles: "گاڑی", running_people: "بھاگتا ہوا شخص", sudden_darkness: "اچانک اندھیرا", rain: "بارش", smoke: "دھواں" },
            "sanskrit": { vehicles: "वाहनम्", running_people: "धावन् जनः", sudden_darkness: "सहसा अन्धकारः", rain: "वृष्टिः", smoke: "धूमः" },
            "kashmiri": { vehicles: "गाड", running_people: "दवाण इंसान", sudden_darkness: "अचानक गोब अंधकार", rain: "रुद", smoke: "दह" },
            "sindhi": { vehicles: "گاڏي", running_people: "ڀڄندڙ ماڻهو", sudden_darkness: "اچانک اونداهي", rain: "مينهن", smoke: "دونهون" },
            "konkani": { vehicles: "वाहन", running_people: "धांवपी मनीस", sudden_darkness: "झळकन काळोख", rain: "पाऊस", smoke: "धूंवर" },
            "manipuri": { vehicles: "গারী", running_people: "চেল্লিবা মীওই", sudden_darkness: "খঙহৌদনা অমম্বা", rain: "নোংচুবা", smoke: "মৈখু" },
            "nepali": { vehicles: "सवारी साधन", running_people: "दौडिरहेको मान्छे", sudden_darkness: "अचानक अँध्यारो", rain: "पानी परेको", smoke: "धुवाँ" },
            "bodo": { vehicles: "गाड़ी", running_people: "खारबाय थानाय सुबुं", sudden_darkness: "हरखाब खोमसि", rain: "अखा", smoke: "अखाय" },
            "dogri": { vehicles: "गड्डी", running_people: "नत्थदा आदमी", sudden_darkness: "अचानक मनेरा", rain: "हनेरा", smoke: "धूआं" },
            "maithili": { vehicles: "गाड़ी", running_people: "दौड़ैत लोक", sudden_darkness: "अचानक अन्धकार", rain: "बरखा", smoke: "धुआँ" },
            "santali": { vehicles: "ᱜᱟᱹᱰᱤ", running_people: "ᱫᱟᱹᱲᱮᱫ ᱦᱚᱲ", sudden_darkness: "ᱦᱚᱴᱟᱛ ᱧᱩᱛ", rain: "ᱫᱟᱜ", smoke: "ᱫᱷᱩᱶᱟᱹ" },
            "spanish": { vehicles: "Vehículo", running_people: "Persona corriendo", sudden_darkness: "Oscuridad repentina", rain: "Lluvia", smoke: "Humo" },
            "french": { vehicles: "Véhicule", running_people: "Personne qui court", sudden_darkness: "Obscurité soudaine", rain: "Pluie", smoke: "Fumée" },
            "arabic": { vehicles: "مركبة", running_people: "شخص يركض", sudden_darkness: "ظلام مفاجئ", rain: "مطر", smoke: "دخان" },
            "chinese": { vehicles: "车辆", running_people: "奔跑的人", sudden_darkness: "突然变暗", rain: "下雨", smoke: "烟雾" },
            "japanese": { vehicles: "車両", running_people: "走っている人", sudden_darkness: "急な暗闇", rain: "雨", smoke: "煙" },
            "german": { vehicles: "Fahrzeug", running_people: "Rennende Person", sudden_darkness: "Plötzliche Dunkelheit", rain: "Regen", smoke: "Rauch" },
            "portuguese": { vehicles: "Veículo", running_people: "Pessoa correndo", sudden_darkness: "Escuridão repentina", rain: "Chuva", smoke: "Fumaça" }
        };

        const dangerTranslations = {
            "english": {
                danger_from_left: "Danger! Fast object approaching from left! Move right immediately!",
                danger_from_right: "Danger! Fast object approaching from right! Move left immediately!",
                danger_from_front: "Danger! Fast object approaching from front! Move sideways immediately!",
                danger_from_behind: "Danger! Fast object approaching from behind! Move forward fast immediately!",
                safe_now: "Safe now. Continuing navigation.",
                path_clear: "Path clear. Safe to continue."
            },
            "hindi": {
                danger_from_left: "खतरा! बाईं ओर से तेज वस्तु आ रही है! तुरंत दाईं ओर हटें!",
                danger_from_right: "खतरा! दाईं ओर से तेज वस्तु आ रही है! तुरंत बाईं ओर हटें!",
                danger_from_front: "खतरा! सामने से तेज वस्तु आ रही है! तुरंत अगल-बगल हटें!",
                danger_from_behind: "खतरा! पीछे से तेज वस्तु आ रही है! तुरंत तेजी से आगे बढ़ें!",
                safe_now: "अब सुरक्षित है। नेविगेशन जारी रख रहे हैं।",
                path_clear: "रास्ता साफ है। आगे बढ़ना सुरक्षित है।"
            },
            "tamil": {
                danger_from_left: "ஆபத்து! இடமிருந்து வேகமான பொருள் நெருங்குகிறது! உடனே வலப்புறம் நகருங்கள்!",
                danger_from_right: "ஆபத்து! வலமிருந்து வேகமான பொருள் நெருங்குகிறது! உடனே இடப்புறம் நகருங்கள்!",
                danger_from_front: "ஆபத்து! முன்னால் வேகமான பொருள் நெருங்குகிறது! உடனே பக்கவாட்டில் நகருங்கள்!",
                danger_from_behind: "ஆபத்து! பின்னால் வேகமான பொருள் நெருங்குகிறது! உடனே வேகமாக முன்னேறிச் செல்லுங்கள்!",
                safe_now: "இப்போது பாதுகாப்பானது. வழிகாட்டுதல் தொடர்கிறது.",
                path_clear: "பாதை தெளிவாக உள்ளது. தொடரலாம்."
            },
            "telugu": {
                danger_from_left: "ప్రమాదం! ఎడమ నుండి వేగవంతమైన వస్తువు వస్తోంది! వెంటనే కుడి వైపునకు జరగండి!",
                danger_from_right: "ప్రమాదం! కుడి నుండి వేగవంతమైన వస్తువు వస్తోంది! వెంటనే ఎడమ వైపునకు జరగండి!",
                danger_from_front: "ప్రమాదం! ముందు నుండి వేగవంతమైన వస్తువు వస్తోంది! వెంటనే పక్కకు జరగండి!",
                danger_from_behind: "ప్రమాదం! వెనుక నుండి వేగవంతమైన వస్తువు వస్తోంది! వెంటనే వేగంగా ముందుకు వెళ్ళండి!",
                safe_now: "ఇప్పుడు సురక్షితం. నావిగేషన్ కొనసాగుతోంది.",
                path_clear: "దారి ఖాళీగా ఉంది. ముందుకు వెళ్లడం సురక్షితం."
            },
            "kannada": {
                danger_from_left: "ಅಪಾಯ! ಎಡಭಾಗದಿಂದ ವೇಗವಾದ ವಸ್ತು ಬರುತ್ತಿದೆ! ತಕ್ಷಣ ಬಲಭಾಗಕ್ಕೆ ಸರಿಯಿರಿ!",
                danger_from_right: "ಅಪಾಯ! ಬಲಭಾಗದಿಂದ ವೇಗವಾದ ವಸ್ತು ಬರುತ್ತಿದೆ! ತಕ್ಷಣ ಎಡಭಾಗಕ್ಕೆ ಸರಿಯಿರಿ!",
                danger_from_front: "ಅಪಾಯ! ಮುಂಭಾಗದಿಂದ ವೇಗವಾದ ವಸ್ತು ಬರುತ್ತಿದೆ! ತಕ್ಷಣ ಪಕ್ಕಕ್ಕೆ ಸರಿಯಿರಿ!",
                danger_from_behind: "ಅಪಾಯ! ಹಿಂಭಾಗದಿಂದ ವೇಗವಾದ ವಸ್ತು ಬರುತ್ತಿದೆ! ತಕ್ಷಣ ವೇಗವಾಗಿ ಮುಂದೆ ಹೋಗಿ!",
                safe_now: "ಈಗ ಸುರಕ್ಷಿತ. ನ್ಯಾವಿಗೇಶನ್ ಮುಂದುವರಿಯುತ್ತಿದೆ.",
                path_clear: "ಮಾರ್ಗ ಮುಕ್ತವಾಗಿದೆ. ಮುಂದುವರಿಯಲು ಸುರಕ್ಷಿತ."
            },
            "malayalam": {
                danger_from_left: "അപകടം! ഇടതുവശത്തുനിന്ന് വേഗത്തിൽ ഒരു വസ്തു വരുന്നു! ഉടൻ വലത്തോട്ട് മാറുക!",
                danger_from_right: "അപകടം! വലതുവശത്തുനിന്ന് വേഗത്തിൽ ഒരു വസ്തു വരുന്നു! ഉടൻ ഇടത്തോട്ട് മാറുക!",
                danger_from_front: "അപകടം! മുന്നിൽനിന്ന് വേഗത്തിൽ ഒരു വസ്തു വരുന്നു! ഉടൻ വശങ്ങളിലേക്ക് മാറുക!",
                danger_from_behind: "അപകടം! പിന്നിൽനിന്ന് വേഗത്തിൽ ഒരു വസ്തു വരുന്നു! ഉടൻ വേഗത്തിൽ മുന്നോട്ട് നീങ്ങുക!",
                safe_now: "ഇപ്പോൾ സുരക്ഷിതമാണ്. നാവിഗേഷൻ തുടരുന്നു.",
                path_clear: "വഴി വ്യക്തമാണ്. തുടരുന്നത് സുരക്ഷിതമാണ്."
            },
            "bengali": {
                danger_from_left: "বিপদ! বাম দিক থেকে দ্রুত বস্তু আসছে! অবিলম্বে ডান দিকে সরুন!",
                danger_from_right: "বিপদ! ডান দিক থেকে দ্রুত বস্তু আসছে! অবিলম্বে বাম দিকে সরুন!",
                danger_from_front: "বিপদ! সামনে থেকে দ্রুত বস্তু আসছে! অবিলম্বে পাশে সরুন!",
                danger_from_behind: "বিপদ! পিছন থেকে দ্রুত বস্তু আসছে! অবিলম্বে দ্রুত সামনে এগিয়ে যান!",
                safe_now: "এখন নিরাপদ। নেভিগেশন আবার শুরু হচ্ছে।",
                path_clear: "পথ পরিষ্কার। এগিয়ে যাওয়া নিরাপদ।"
            },
            "marathi": {
                danger_from_left: "धोका! डाव्या बाजूने वेगाने वस्तू येत आहे! लगेच उजवीकडे व्हा!",
                danger_from_right: "धोका! उजव्या बाजूने वेगाने वस्तू येत आहे! लगेच डावीकडे व्हा!",
                danger_from_front: "धोका! समोरून वेगाने वस्तू येत आहे! लगेच बाजूला व्हा!",
                danger_from_behind: "धोका! मागून वेगाने वस्तू येत आहे! लगेच वेगाने पुढे जा!",
                safe_now: "आता सुरक्षित आहे. नेव्हिगेशन सुरू ठेवत आहे.",
                path_clear: "मार्ग मोकळा आहे. पुढे जाणे सुरक्षित आहे।"
            },
            "gujarati": {
                danger_from_left: "ખતરો! ડાબી બાજુથી ઝડપી વસ્તુ આવી રહી છે! તરત જ જમણી બાજુ ખસો!",
                danger_from_right: "ખતરો! જમણી બાજુથી ઝડપી વસ્તુ આવી રહી છે! તરત જ ડાબી બાજુ ખસો!",
                danger_from_front: "ખતરો! સામેથી ઝડપી વસ્તુ આવી રહી છે! તરત જ બાજુ પર ખસો!",
                danger_from_behind: "ખતરો! પાછળથી ઝડપી વસ્તુ આવી રહી છે! તરત જ ઝડપથી આગળ વધો!",
                safe_now: "હવે સુરક્ષિત છે. નેવિગેશન ચાલુ રાખીએ છીએ.",
                path_clear: "રસ્તો સાફ છે. આગળ વધવું સુરક્ષિત છે."
            },
            "punjabi": {
                danger_from_left: "ਖਤਰਾ! ਖੱਬੇ ਪਾਸਿਓਂ ਤੇਜ਼ ਵਸਤੂ ਆ ਰਹੀ ਹੈ! ਤੁਰੰਤ ਸੱਜੇ ਪਾਸੇ ਹੋਵੋ!",
                danger_from_right: "ਖਤਰਾ! ਸੱਜੇ ਪਾਸਿਓਂ ਤੇਜ਼ ਵਸਤੂ ਆ ਰਹੀ ਹੈ! ਤੁਰੰਤ ਖੱਬੇ ਪਾਸੇ ਹੋਵੋ!",
                danger_from_front: "ਖਤਰਾ! ਸਾਹਮਣੇ ਤੋਂ ਤੇਜ਼ ਵਸਤੂ ਆ ਰਹੀ ਹੈ! ਤੁਰੰਤ ਪਾਸੇ ਹੋਵੋ!",
                danger_from_behind: "ਖਤਰਾ! ਪਿੱਛੇ ਤੋਂ ਤੇਜ਼ ਵਸਤੂ ਆ ਰਹੀ ਹੈ! ਤੁਰੰਤ ਤੇਜ਼ੀ ਨਾਲ ਅੱਗੇ ਵਧੋ!",
                safe_now: "ਹੁਣ ਸੁਰੱਖਿਅत ਹੈ। ਨੇਵੀਗੇਸ਼ਨ ਜਾਰੀ ਰੱਖ ਰਹੇ ਹਾਂ।",
                path_clear: "ਰਾਹ ਸਾਫ਼ ਹੈ। ਅੱਗੇ ਵਧਣਾ ਸੁਰੱਖਇਤ ਹੈ।"
            },
            "odia": {
                danger_from_left: "ବିପଦ! ବାମ ପଟୁ ଦ୍ରୁତ ବସ୍ତୁ ଆସୁଛି! ତୁରନ୍ତ ଡାହାଣକୁ ଘୁଞ୍ଚନ୍ତୁ!",
                danger_from_right: "ବିପଦ! ଡାହାଣ ପଟୁ ଦ୍ରୁତ ବସ୍ତು ଆସୁଛି! ତୁରନ୍ତ ବାମକୁ ଘୁଞ୍ଚନ୍ତୁ!",
                danger_from_front: "ବିପଦ! ସାମ୍ନାରୁ ଦ୍ରୁତ ବସ୍ତୁ ଆସୁଛି! ତୁରନ୍ତ ପାର୍ଶ୍ୱକୁ ଘୁଞ୍ଚନ୍ତୁ!",
                danger_from_behind: "ବିପଦ! ପଛପଟୁ ଦ୍ରୁତ ବସ୍ତୁ ଆସୁଛି! ତୁରନ୍ତ ଦ୍ରୁତ ଗତିରେ ଆଗକୁ ବଢନ୍ତୁ!",
                safe_now: "ଏବे ସୁରକ୍ଷିତ। ନେଭିଗେସନ ଜାରି ରଖୁଛୁ।",
                path_clear: "ରାସ୍ତା ସଫା ଅଛି। ଆଗକୁ ଯିବା ସୁରକ୍ଷିତ।"
            },
            "assamese": {
                danger_from_left: "বিপদ! বাওঁফালৰ পৰা দ্ৰুত বস্তু আহি আছে! লগে লগে সোঁফালে যাওক!",
                danger_from_right: "বিপদ! সোঁফালৰ পৰা দ্ৰুত বস্তু আহি আছে! লগে লগে বাওঁফালে যাওক!",
                danger_from_front: "বিপদ! সন্মুখৰ পৰা দ্ৰুত বস্তু আহি আছে! লগে লগে কাষলৈ আঁতৰি যাওক!",
                danger_from_behind: "বিপদ! পিছফালৰ পৰা দ্ৰুত বস্তু আহি আছে! লগে লগে খৰকৈ আগবাঢ়ক!",
                safe_now: "এতিয়া নিৰাপদ। নেভিগেশ্যন অব্যাহত ৰাখিছোঁ।",
                path_clear: "পথ মুকলি। আগবাঢ়িবলৈ নিৰাপদ।"
            },
            "urdu": {
                danger_from_left: "خطرہ! بائیں طرف سے تیز چیز آ رہی ہے! فوری دائیں طرف ہو جائیں!",
                danger_from_right: "خطرہ! دائیں طرف سے تیز چیز آ رہی ہے! فوری بائیں طرف ہو جائیں!",
                danger_from_front: "خطرہ! سامنے سے تیز چیز آ رہی ہے! فوری ایک طرف ہو جائیں!",
                danger_from_behind: "خطرہ! پیچھے سے تیز چیز آ رہی ہے! فوری تیزی سے آگے بڑھیں!",
                safe_now: "اب محفوظ ہے۔ نیویگیشن جاری رکھ رہے ہیں۔",
                path_clear: "راستہ صاف ہے۔ آگے بڑھنا محفوظ ہے۔"
            },
            "sanskrit": {
                danger_from_left: "आपत्! वामतः द्रुतवस्तु आयाति! शीघ्रं दक्षिणतः सरतु!",
                danger_from_right: "आपत्! दक्षिणतः द्रुतवस्तु आयाति! शीघ्रं वामतः सरतु!",
                danger_from_front: "आपत्! पुरतः द्रुतवस्तु आयाति! शीघ्रं पार्श्वतः सरतु!",
                danger_from_behind: "आपत्! पृष्ठतः द्रुतवस्तु आयाति! शीघ्रं वेगेन अग्रे गच्छतु!",
                safe_now: "अधुना सुरक्षितम्। मार्गदर्शनं प्रचलति।",
                path_clear: "मार्गः रिक्तः। गन्तुं सुरक्षितम्।"
            },
            "kashmiri": {
                danger_from_left: "ख़तरनाक! ख्वर तर्फ़ प्यठ छु तेज़ चीज़ यवान! जलद दचुन तर्फ़ गछिव!",
                danger_from_right: "ख़तरनाक! दचुन तर्फ़ प्यठ छु तेज़ चीज़ यवान! जलद ख्वर तर्फ़ गछिव!",
                danger_from_front: "ख़तरनाक! ब्रोह कनि प्यठ छु तेज़ चीज़ यवान! जलद कनि गछिव!",
                danger_from_behind: "ख़तरनाक! पतो कनि प्यठ छु तेज़ चीज़ यवान! जलद तेज़ ब्रोह गछिव!",
                safe_now: "वूनि छु महफूज़। नेविगेशन चालु।",
                path_clear: "वाथ छा साफ। अग्रे गछुन महफूज़।"
            },
            "sindhi": {
                danger_from_left: "خطرو! کاٻي پاسي کان تيز شيءِ اچي پئي! ترت ساڄي پاسي ٿيو!",
                danger_from_right: "خطرو! ساڄي پاسي کان تيز شيءِ اچي پئي! ترت کاٻي پاسي ٿيو!",
                danger_from_front: "خطرو! سامهون کان تيز شيءِ اچي پئي! ترت پاسي ٿيو!",
                danger_from_behind: "خطرو! پٺيان کان تيز شيءِ اچي پئي! ترت تيزيءَ سان اڳتي وڌو!",
                safe_now: "هاڻي محفوظ آهي. نيويگيشن جاري رکجي ٿي.",
                path_clear: "رستو صاف آهي. اڳتي وڌڻ محفوظ آهي।"
            },
            "konkani": {
                danger_from_left: "धोको! दाव्या वटेन वेगान वस्तू yeता! रोखडेच उजव्या वटेन वचात!",
                danger_from_right: "धोको! उजव्या वटेन वेगान वस्तू yeता! रोखडेच दाव्या वटेन वचात!",
                danger_from_front: "धोको! मुखारल्यान वेगान वस्तू yeता! रोखडेच कुशीक वचात!",
                danger_from_behind: "धोको! फाटल्यान वेगान वस्तू yeता! रोखडेच वेगान मुखार वचात!",
                safe_now: "आतां सुुरक्षित आसा. नेव्हिगेशन चालू दवरता.",
                path_clear: "रस्तो मेकळो आसा. मुखार वचपाक सुरक्षित आसा."
            },
            "manipuri": {
                danger_from_left: "অকাইবা! ওইরোমদগী থুনা পোৎশক লাক্লি! অতি ওনবা ওইনা যেৎ থংবা নাকোন্না চিংশিনবীয়ু!",
                danger_from_right: "অকাইবা! যেত্রোমদগী থুনা পোৎশক লাক্লি! অতি ওনবা ওইনা ওই থংবা নাকোন্না চিংশিনবীয়ু!",
                danger_from_front: "অকাইবা! মাঙলোমদগী থুনা পোৎশক লাক্লি! অতি ওনবা ওইনা নাকোন্দা চিংশিনবীয়ু!",
                danger_from_behind: "অকাইবা! তুংলোমদগী থুনা পোৎশক লাক্লি! অতি ওনবা ওইনা মাঙলোমদা থুনা চঙশিনবীয়ু!",
                safe_now: "হৌজিক অকাইবা লৈতরে। নেভিগেশন হৌরে।",
                path_clear: "লম্বী শেংলে। মখোয় চৎপা য়ারে।"
            },
            "nepali": {
                danger_from_left: "खतरा! बायाँबाट तीव्र गतिमा वस्तु आउँदैछ! तुरुन्तै दायाँतर्फ लाग्नुहोस्!",
                danger_from_right: "खतरा! दायाँबाट तीव्र गतिमा वस्तु आउँदैछ! तुरुन्तै बायाँतर्फ लाग्नुहोस्!",
                danger_from_front: "खतरा! अगाडिबाट तीव्र गतिमा वस्तु आउँदैछ! तुरुन्तै छेउ लाग्नुहोस्!",
                danger_from_behind: "खतरा! पछाडिबाट तीव्र गतिमा वस्तु आउँदैछ! तुरुन्तै छिटो अगाडि बढ्नुहोस्!",
                safe_now: "अहिले सुरक्षित छ। नेभिगेसन जारी छ।",
                path_clear: "बाटो खाली छ। अघि बढ्न सुरक्षित छ।"
            },
            "bodo": {
                danger_from_left: "खैफोद! आगसिथिंनिफ्राय गोख्रै बेसाद फैगासिनो दं! खनायावनो आगदाथिं थां!",
                danger_from_right: "खैफोद! आगदाथिंनिफ्राय गोख्रै बेसाद फैगासिनो दं! खनायावनो आगसिथिं थां!",
                danger_from_front: "खैफोद! सिगांथिंनिफ्राय गोख्रै बेसाद फैगासिनो दं! खनायावनो सिगां थां!",
                danger_from_behind: "खैफोद! उनथिंनिफ्राय गोख্ৰै बेसाद फैगासिनो दं! खनायावनो उनथिं गोख्रै थां!",
                safe_now: "দানो खैफोद गैया। नेभिगेसन जागायबाय।",
                path_clear: "लामा लांदां। थांनो हाबाय।"
            },
            "dogri": {
                danger_from_left: "खतरा! खब्बै पासै थमां तेज वस्तु आ करदी ऐ! तुरत सज्जै पासै ओओ!",
                danger_from_right: "खतरा! सज्जै पासै थमां तेज वस्तु आ करदी ऐ! तुरत खब्बै पासै ओओ!",
                danger_from_front: "खतरा! साहमनै थमां तेज वस्तु आ करदी ऐ! तुरत पासै ओओ!",
                danger_from_behind: "खतरा! पिच्छै थमां तेज वस्तु आ करदी ऐ! तुरत तेजी कन्नै अग्गें बधो!",
                safe_now: "हुण सुरक्षित ऐ। नेविगेशन जारी ऐ।",
                path_clear: "रस्ता साफ ऐ। अग्गें बधना सुरक्षित ऐ।"
            },
            "maithili": {
                danger_from_left: "खतरा! बामा कात स तेज वस्तु आबि रहल अछि! तुरंत दहिना कात हटू!",
                danger_from_right: "खतरा! दहिना कात स तेज वस्तु आबि रहल अछि! तुरंत बामा कात हटू!",
                danger_from_front: "खतरा! सामने स तेज वस्तु आबि रहल अछि! तुरंत कतहु कात हटू!",
                danger_from_behind: "खतरा! पाछा स तेज वस्तु आबि रहल अछि! तुरंत तेजी स आगू बढ़ू!",
                safe_now: "एखन सुरक्षित अछि। नेविगेशन जारी अछि।",
                path_clear: "रस्ता साफ अछि। आगू बढ़ब सुरक्षित अछि।"
            },
            "santali": {
                danger_from_left: "ᱵᱷᱤᱡᱚᱱ ᱮᱰ ᱨᱮ ᱠᱷᱟᱛᱨᱟ! ᱞᱮᱸᱜᱟ ᱥᱮᱫ ᱠᱷᱚᱱ ᱜᱟᱹᱰᱤ ᱦᱤᱡᱩᱜ ᱠᱟնᱟ! ᱡᱚᱡᱚᱢ ᱥᱮᱫ ᱥᱮᱱᱚᱜ ᱢᱮ!",
                danger_from_right: "ᱵᱷᱤᱡᱚᱱ ᱮᱰ ᱨᱮ ᱠᱷﺎᱛᱨᱟ! ᱡᱚᱡᱚᱢ ᱥᱮᱫ ᱠᱷᱚن ᱜᱟᱹᱰᱤ ᱦᱤᱡᱩᱜ ᱠﺎնᱟ! ᱞᱮᱸᱜᱟ ᱥᱮᱫ ᱥᱮᱱۆᱜ ᱢᱮ!",
                danger_from_front: "ᱵᱷᱤᱡᱚᱱ ᱮᱰ ᱨᱮ ᱠᱷᱟᱛᱨᱟ! ᱥᱟᱢᱟᱝ ᱥᱮᱫ ᱠᱷᱚନ ᱜᱟᱹᱰᱤ ᱦᱤᱡᱩᱜ ᱠﺎնᱟ! ᱥᱩᱨ ᱨᱮ ᱥᱮᱱۆᱜ ᱢᱮ!",
                danger_from_behind: "ᱵᱷᱤᱡᱚᱱ ᱮᱰ ᱨᱮ ᱠᱷﺎᱛᱨᱟ! ᱛﺎᱭᱚਮ ᱥᱮᱫ ᱠᱷᱚନ ᱜᱟᱹᱰᱤ ᱦᱤᱡᱩᱜ ᱠﺎնᱟ! ᱛﺎᱭᱚਮ ᱥᱮᱫ ᱛᱟᱹପᱤᱥ ᱥᱮᱱۆᱜ ᱢᱮ!",
                safe_now: "ᱱᱤᱛᱚᱜ ᱵᱟᱸᱪᱟᱣ ᱮᱱᱟ। ᱱᱮᱵᱷᱤᱜᱮᱥᱚᱱ ᱮᱦᱚᱵ ᱮնᱟ।",
                path_clear: "ᱰᱟᱦᱟᱨ ᱥᱟᱯᱷᱟ ᱜေᱭᱟ। ᱥᱮᱱᱚᱜ ᱞᱟᱹᱜ𝐢ᱫ ᱴᱷᱤᱠ ᱜᱮᱭᱟ।"
            },
            "spanish": {
                danger_from_left: "¡Peligro! ¡Objeto rápido aproximándose por la izquierda! ¡Muévete a la derecha inmediatamente!",
                danger_from_right: "¡Peligro! ¡Objeto rápido aproximándose por la derecha! ¡Muévete a la izquierda inmediatamente!",
                danger_from_front: "¡Peligro! ¡Objeto rápido aproximándose por el frente! ¡Muévete a un lado inmediatamente!",
                danger_from_behind: "¡Peligro! ¡Objeto rápido aproximándose por detrás! ¡Muévete hacia adelante rápido inmediatamente!",
                safe_now: "Seguro ahora. Continuando la navegación.",
                path_clear: "Camino despejado. Seguro para continuar."
            },
            "french": {
                danger_from_left: "Danger ! Objet rapide approchant par la gauche ! Déplacez-vous vers la droite immédiatement !",
                danger_from_right: "Danger ! Objet rapide approchant par la droite ! Déplacez-vous vers la gauche immédiatement !",
                danger_from_front: "Danger ! Objet rapide approchant par l'avant ! Déplacez-vous sur le côté immédiatement !",
                danger_from_behind: "Danger ! Objet rapide approchant par derrière ! Déplacez-vous vers l'avant rapidement immédiatement !",
                safe_now: "Sécurité maintenant. Poursuite de la navigation.",
                path_clear: "Voie libre. Sûr pour continuer."
            },
            "arabic": {
                danger_from_left: "خطر! جسم سريع يقترب من اليسار! تحرك إلى اليمين فورًا!",
                danger_from_right: "خطر! جسم سريع يقترب من اليمين! تحرك إلى اليسار فورًا!",
                danger_from_front: "خطر! جسم سريع يقترب من الأمام! تحرك جانبًا فورًا!",
                danger_from_behind: "خطر! جسم سريع يقترب من الخلف! تحرك إلى الأمام بسرعة فورًا!",
                safe_now: "آمن الآن. جاري مواصلة الملاحة.",
                path_clear: "المسار خالٍ. آمن للمتابعة."
            },
            "chinese": {
                danger_from_left: "危险！快速物体正从左侧接近！请立即向右移动！",
                danger_from_right: "危险！快速物体正从右侧接近！请立即向左移动！",
                danger_from_front: "危险！快速物体正从前方接近！请立即向侧面移动！",
                danger_from_behind: "危险！快速物体正从后方接近！请立即向前移动！",
                safe_now: "现在安全了。继续导航。",
                path_clear: "道路畅通。可以继续前行。"
            },
            "japanese": {
                danger_from_left: "危険！左から速い物体が近づいています！すぐに右へ移動してください！",
                danger_from_right: "危険！右から速い物体が近づいています！すぐに左へ移動してください！",
                danger_from_front: "危険！前から速い物体が近づいています！すぐに横へ移動してください！",
                danger_from_behind: "危険！後ろから速い物体が近づいています！すぐに前へ移動してください！",
                safe_now: "安全になりました。ナビゲーションを続けます。",
                path_clear: "道はクリアです。進んで大丈夫です。"
            },
            "german": {
                danger_from_left: "Gefahr! Schnelles Objekt nähert sich von links! Sofort nach rechts ausweichen!",
                danger_from_right: "Gefahr! Schnelles Objekt nähert sich von rechts! Sofort nach links ausweichen!",
                danger_from_front: "Gefahr! Schnelles Objekt nähert sich von vorne! Sofort zur Seite ausweichen!",
                danger_from_behind: "Gefahr! Schnelles Objekt nähert sich von hinten! Sofort schnell nach vorne bewegen!",
                safe_now: "Jetzt sicher. Navigation wird fortgesetzt.",
                path_clear: "Weg ist frei. Sicher zum Weitergehen."
            },
            "portuguese": {
                danger_from_left: "Perigo! Objeto rápido se aproximando pela esquerda! Mova-se para a direita imediatamente!",
                danger_from_right: "Perigo! Objeto rápido se aproximando pela direita! Mova-se para a esquerda imediatamente!",
                danger_from_front: "Perigo! Objeto rápido se aproximando pela frente! Mova-se para o lado imediatamente!",
                danger_from_behind: "Perigo! Objeto rápido se aproximando por trás! Mova-se para a frente rápido imediatamente!",
                safe_now: "Seguro agora. Continuando a navegação.",
                path_clear: "Caminho livre. Seguro para continuar."
            }
        };

        function processVoiceCommand(text) {
            const normalizedText = text.toLowerCase().trim();

            // 1. Language Onboarding Flow handler
            if (onboardingStep === "waiting-language" || onboardingStep === "greeting") {
                for (const key in supportedLanguages) {
                    if (normalizedText.includes(key)) {
                        selectedLanguageKey = key;
                        activeLanguageBadge.textContent = "Selected Language: " + supportedLanguages[key].name;
                        onboardingStep = "ready";
                        
                        if (recognitionEngine) {
                            recognitionEngine.stop();
                        }
                        
                        speakText(supportedLanguages[key].name + " selected. " + getTranslation("greeting"));
                        
                        setTimeout(() => {
                            initAll();
                        }, 2000);
                        return;
                    }
                }
            }            // 2. Main Liki command parser (including English phonetic homophones for 100% wake-word accuracy)
            const triggerWords = [
                "vision", "lucky", "ricky", "mickey", "sticky", "licky"
            ];
            let hasTrigger = false;
            
            // Exact word list match
            for (const trig of triggerWords) {
                if (normalizedText.includes(trig)) {
                    hasTrigger = true;
                    break;
                }
            }
            
            const isDirectCommand = 
                normalizedText.includes("scan") || 
                normalizedText.includes("camp") ||
                normalizedText.includes("can") ||
                normalizedText.includes("span") ||
                normalizedText.includes("stop") || 
                normalizedText.includes("navigate") || 
                normalizedText.includes("go to") ||
                normalizedText.includes("help") ||
                normalizedText.includes("call") ||
                normalizedText.includes("forward") ||
                normalizedText.includes("back") ||
                normalizedText.includes("front");

            if (hasTrigger || isDirectCommand) {
                // Stop recognition immediately upon trigger to avoid duplicate interim fires
                if (recognitionEngine) {
                    try { recognitionEngine.stop(); } catch(err) {}
                }
                playSpatialBeep(900, 0, 0.2);

                // --- HELP COMMAND ---
                if (normalizedText.includes("help") || normalizedText.includes("what can you do")) {
                    speakText("Available commands are: scan, stop, navigate to a destination, and call for emergency.", 1, 0.95);
                    return;
                }

                // ── CAMERA DIRECTION COMMANDS ──────────────────────────
                // "Liki forward" / "liki back" -> switch to back camera
                if (normalizedText.includes("forward") || normalizedText.includes("back camera") ||
                    normalizedText.includes("आगे") || normalizedText.includes("पीछे कैमरा")) {
                    speakText("Switching to back camera.", 1, 1.0, 1.0, 0.9);
                    startCamera('environment').then(() => {
                        speakText("Back camera active. Scanning forward.", 1, 1.0, 1.0, 0.9);
                    });
                    return;
                }

                // "Liki front" / "liki look up" / "liki selfie" -> front camera
                if (normalizedText.includes("front") || normalizedText.includes("look up") ||
                    normalizedText.includes("selfie") || normalizedText.includes("सामने") ||
                    normalizedText.includes("மட்டும்") || normalizedText.includes("ముందు")) {
                    speakText("Switching to front camera.", 1, 1.0, 1.0, 0.9);
                    startCamera('user').then(() => {
                        speakText("Front camera active.", 1, 1.0, 1.0, 0.9);
                    });
                    return;
                }

                // Instant Scan Command
                if (normalizedText.includes("scan") || normalizedText.includes("camp") || 
                    normalizedText.includes("can") || normalizedText.includes("span")) {
                    if (!isAutoscanActive) {
                        isScanLoopRunning = true;
                        speakText("Scanning active. Analyzing your surroundings now.", 0, 0.9, 1.0, 0.9);
                        triggerFastScanCycle();
                    } else if (!isScanLoopRunning) {
                        isScanLoopRunning = true;
                        speakText("Scanning resumed. Analyzing your surroundings now.", 0, 0.9, 1.0, 0.9);
                        triggerFastScanCycle();
                    } else {
                        speakText("Scanning is already active.", 0, 0.9, 1.0, 0.9);
                    }
                    return;
                }

                // Stop Command
                if (normalizedText.includes("stop") || normalizedText.includes("रुको") || normalizedText.includes("நிறுத்து") || normalizedText.includes("ఆపు") || normalizedText.includes("ನಿಲ್ಲಿಸು") || normalizedText.includes("നിർത്തുക")) {
                    isAutoscanActive = false;
                    if (dangerInterval) {
                        clearInterval(dangerInterval);
                        dangerInterval = null;
                    }
                    isDangerActive = false;
                    dangerDetails = null;
                    if (speechSynth.speaking) {
                        speechSynth.cancel();
                    }
                    speakText(getTranslation("stop"));
                    badgeGpsDest.className = 'badge';
                    badgeGpsDest.querySelector('span').textContent = "Ready";
                    directionsContainer.innerHTML = `
                        <div class="direction-step active-step">
                            <i class="fa-solid fa-location-crosshairs"></i>
                            <div>GPS receiver ready. Say "Hey Liki navigate to [destination]" to initiate directions.</div>
                        </div>
                    `;
                    return;
                }

                // Navigate Command
                if (normalizedText.includes("navigate to") || normalizedText.includes("go to") || normalizedText.includes("मार्गदर्शन") || normalizedText.includes("வழிசெலுத்து") || normalizedText.includes("నావిగేట్ చేయండి") || normalizedText.includes("ಮಾರ್ग ತೋರಿಸು") || normalizedText.includes("ನಾవిగేറ്റ് ചെയ്യുക")) {
                    let destination = "";
                    if (normalizedText.includes("navigate to")) {
                        destination = normalizedText.split("navigate to")[1].trim();
                    } else if (normalizedText.includes("go to")) {
                        destination = normalizedText.split("go to")[1].trim();
                    } else {
                        destination = "your destination";
                    }

                    badgeGpsDest.className = 'badge success-badge';
                    badgeGpsDest.querySelector('span').textContent = destination.substring(0, 15);
                    triggerNavigationRoute(destination);
                    return;
                }

                // Phone Call Command
                if (normalizedText.includes("call") || normalizedText.includes("फ़ोन") || normalizedText.includes("அழைப்பு") || normalizedText.includes("కాల్ చేయండి") || normalizedText.includes("ಕಾಲ್ ಮಾಡು") || normalizedText.includes("വിളിക്കുക")) {
                    let recipient = normalizedText.split("call")[1] || "operator";
                    speakText("Calling " + recipient + " now.");
                    setTimeout(() => {
                        window.open("tel:911", "_self");
                    }, 1500);
                    return;
                }

                // "Liki" or "Vision" alone -> start everything if not already active
                if (!isAutoscanActive) {
                    playSpatialBeep(523, 0, 0.25);
                    initAll(); // Triggers camera, mic, scanning, and Liki intro speech
                } else if (!isScanLoopRunning) {
                    isScanLoopRunning = true;
                    playSpatialBeep(523, 0, 0.25);
                    triggerFastScanCycle();
                    speakText("I'm here. Scanning resumed.", 0, 0.9, 1.0, 0.9);
                } else {
                    playSpatialBeep(523, 0, 0.25);
                    speakText("I'm here. What do you need?", 0, 0.9, 1.0, 0.9);
                }
            }
        } // Close processVoiceCommand

        function playSpatialBeep(freq, pan, vol = 0.3) {
            initAudioContext();
            if (!audioContext) return;

            const osc = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
            
            let pannerNode;
            if (audioContext.createStereoPanner) {
                pannerNode = audioContext.createStereoPanner();
                pannerNode.pan.setValueAtTime(pan, audioContext.currentTime);
            } else {
                pannerNode = audioContext.createPanner();
                pannerNode.panningModel = 'HRTF';
                pannerNode.setPosition(pan, 0, 1 - Math.abs(pan));
            }
            
            osc.connect(gainNode);
            gainNode.connect(pannerNode);
            pannerNode.connect(audioContext.destination);
            
            osc.start();
            osc.stop(audioContext.currentTime + duration);
        }

        function screenReaderAnnounce(text, priority = 'polite') {
            const el = document.createElement('div');
            el.className = 'sr-only';
            el.setAttribute('aria-live', priority === 'assertive' ? 'assertive' : 'polite');
            el.textContent = text;
            screamerBox.appendChild(el);
            setTimeout(() => el.remove(), 4000);
        }

        // Camera Management
        async function startCamera(facing) {
            facing = facing || 'environment';
            try {
                // Stop existing tracks to release camera before switching
                if (videoStream) {
                    videoStream.getTracks().forEach(t => t.stop());
                    videoStream = null;
                    webcam.srcObject = null;
                }
                videoStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: { ideal: facing } }
                });
                webcam.srcObject = videoStream;
                webcam.style.display = 'block';
                imagePreview.style.display = 'none';
                viewportPlaceholder.style.display = 'none';
                viewportContainer.classList.add('active-border');
                screenReaderAnnounce("Webcam interface active.");
            } catch (e) {
                console.error("Camera startup failed:", e);
                webcam.style.display = 'none';
                viewportPlaceholder.style.display = 'flex';
                viewportPlaceholder.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color:var(--error);"></i><p>Webcam blocked or unavailable.</p>`;
                screenReaderAnnounce("Camera startup blocked. Voice navigation active.");
            }
        }

        // Web Audio analysis for sudden loud sounds (vehicle horns)
        async function startMicrophoneMonitoring() {
            try {
                initAudioContext();
                microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const source = audioContext.createMediaStreamSource(microphoneStream);
                
                analyser = audioContext.createAnalyser();
                analyser.fftSize = 256;
                source.connect(analyser);

                badgeDb.classList.add('active');
                dbValueText.textContent = "Listening";

                const dataArray = new Uint8Array(analyser.frequencyBinCount);
                
                // Footstep / Movement Detection State
                let noiseBaseline = 20;   // rolling average ambient noise level
                let lastFootstepTime = 0; // debounce: don't repeat within 4 sec
                const FOOTSTEP_COOLDOWN_MS = 4000;

                function checkDecibels() {
                    if (!isMicAlarmActive) return;
                    analyser.getByteFrequencyData(dataArray);
                    
                    // Compute overall average (all frequencies)
                    let sum = 0;
                    for (let i = 0; i < dataArray.length; i++) {
                        sum += dataArray[i];
                    }
                    const avg = sum / dataArray.length;
                    const db = Math.round((avg / 255) * 100);

                    // ── Low-frequency energy (bins 0-15 ≈ 0–1500 Hz)
                    // Footsteps/thumps concentrate energy here
                    let lowSum = 0;
                    const LOW_BINS = Math.min(16, dataArray.length);
                    for (let i = 0; i < LOW_BINS; i++) lowSum += dataArray[i];
                    const lowAvg = lowSum / LOW_BINS;

                    // ── High-frequency energy (bins 60-127 ≈ 6kHz+)
                    // Vehicle horns concentrate energy here
                    let highSum = 0;
                    const HIGH_START = Math.floor(dataArray.length * 0.47);
                    for (let i = HIGH_START; i < dataArray.length; i++) highSum += dataArray[i];
                    const highAvg = highSum / (dataArray.length - HIGH_START);

                    dbValueText.textContent = db + " dB";

                    // Rolling baseline (slow rise, fast fall)
                    noiseBaseline = noiseBaseline * 0.97 + db * 0.03;
                    const spikeAboveBaseline = db - noiseBaseline;

                    // ── HORN DETECTION: large overall spike AND high-frequency dominated
                    if (db > 78 && highAvg > lowAvg * 1.2) {
                        dbWarningAlert.textContent = "LOUD SPIKE!";
                        dbWarningAlert.classList.add('spiked');
                        playSpatialBeep(1200, 0, 0.45);
                        
                        const hornAnnounce = getTranslation("horn");
                        screenReaderAnnounce(hornAnnounce, "assertive");
                        speakText(hornAnnounce, 1, 1.3, 1.2, 1.0); // Urgent tone

                        setTimeout(() => {
                            dbWarningAlert.textContent = "Sound Monitor";
                            dbWarningAlert.classList.remove('spiked');
                        }, 2500);

                    // ── FOOTSTEP / MOVEMENT DETECTION: sudden spike dominated by low freq
                    } else if (
                        spikeAboveBaseline > 22 &&        // clearly louder than ambient
                        lowAvg > highAvg * 1.5 &&         // low-frequency dominated (thumping)
                        db > 35 &&                        // minimum audible threshold
                        db < 80 &&                        // not a loud horn
                        (Date.now() - lastFootstepTime) > FOOTSTEP_COOLDOWN_MS
                    ) {
                        lastFootstepTime = Date.now();
                        dbWarningAlert.textContent = "Movement!";
                        dbWarningAlert.classList.add('spiked');

                        // Spatial warning beep panned to rear (behind = center with low freq)
                        playSpatialBeep(320, 0, 0.55, 0.9);

                        // Urgent warning speech
                        const footAlert = getTranslation("footsteps_alert") ||
                            "Caution! Movement detected behind you!";
                        screenReaderAnnounce(footAlert, "assertive");
                        speakText(footAlert, 2, 1.35, 1.3, 1.0); // Max priority, urgent

                        setTimeout(() => {
                            dbWarningAlert.textContent = "Sound Monitor";
                            dbWarningAlert.classList.remove('spiked');
                        }, 3000);
                    }
                    
                    setTimeout(() => requestAnimationFrame(checkDecibels), 100);
                }
                
                checkDecibels();

            } catch (err) {
                console.error("Mic access denied:", err);
                isMicAlarmActive = false;
            }
        }

        // Dark Area Detection
        let darknessWarned = false;
        function scanFrameBrightness(canvasCtx, width, height) {
            // Only run when camera stream is active
            if (!videoStream) {
                darkAlert.style.display = 'none';
                return false;
            }
            try {
                const imgData = canvasCtx.getImageData(0, 0, width, height);
                const pixels = imgData.data;
                let colorSum = 0;
                
                for (let i = 0; i < pixels.length; i += 16) {
                    const r = pixels[i];
                    const g = pixels[i + 1];
                    const b = pixels[i + 2];
                    colorSum += (r + g + b) / 3;
                }
                
                const avgBrightness = colorSum / (pixels.length / 16);
                
                if (avgBrightness < 28) {  // Stricter threshold to reduce false positives
                    darkAlert.style.display = 'flex';
                    badgeLight.className = 'badge active';
                    badgeLight.querySelector('span').textContent = "Low Light";
                    
                    if (!darknessWarned) {
                        darknessWarned = true;
                        playSpatialBeep(1400, 0, 0.4);
                        const translatedEvent = getEventTranslation("sudden_darkness");
                        const warningSpeech = getTranslation("caution") + " " + translatedEvent + " " + getTranslation("detected");
                        screenReaderAnnounce(warningSpeech, "assertive");
                        speakText(warningSpeech, 1);
                    }
                    return true;
                } else {
                    darkAlert.style.display = 'none';
                    badgeLight.className = 'badge success-badge';
                    badgeLight.querySelector('span').textContent = "Lux Clear";
                    darknessWarned = false;
                    return false;
                }
            } catch(e) {
                darkAlert.style.display = 'none';
                return false;
            }
        }

        function snapFrame() {
            if (!videoStream) return null;

            const canvas = document.getElementById('hidden-canvas');
            const context = canvas.getContext('2d');
            canvas.width = webcam.videoWidth || 640;
            canvas.height = webcam.videoHeight || 480;
            context.drawImage(webcam, 0, 0, canvas.width, canvas.height);

            scanFrameBrightness(context, canvas.width, canvas.height);

            viewportContainer.style.opacity = '0.7';
            setTimeout(() => viewportContainer.style.opacity = '1', 50);

            return canvas.toDataURL('image/jpeg');
        }

        // Send base64 image data to Flask backend `/analyze` API
        let requestPending = false;
        async function runAIAnalysis(dataUrl) {
            if (requestPending) return;
            requestPending = true;

            scanner.style.display = 'block';
            badgeScan.className = 'badge active';
            badgeScan.querySelector('span').textContent = getTranslation("scanning");

            try {
                const res = await fetch('/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        image: dataUrl,
                        language: supportedLanguages[selectedLanguageKey].name
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.error) {
                        narratorOutput.textContent = getTranslation("scanning");
                    } else {
                        processAIResult(data);
                    }
                } else {
                    throw new Error("HTTP error " + res.status);
                }
            } catch (e) {
                console.error("AI Analysis error:", e);
                // ALWAYS display localized "Scanning..." strictly per requirements, no fallback text
                narratorOutput.textContent = getTranslation("scanning");
            } finally {
                scanner.style.display = 'none';
                requestPending = false;
            }
        }

        // Process Gemini API Result & Trigger Spatial Sounds
        function processAIResult(payload) {
            badgeScan.className = 'badge success-badge';
            badgeScan.querySelector('span').textContent = "Synced";
            blipsHolder.innerHTML = '';

            // Handle Smart Danger Alerts
            if (payload.smart_danger && payload.smart_danger.detected) {
                handleDangerDetected(payload.smart_danger);
                return;
            } else if (isDangerActive) {
                handleDangerCleared();
                return;
            }

            // Sudden event checking: vehicles, running people, sudden darkness, rain, smoke
            if (payload.detected_events) {
                const events = payload.detected_events;
                for (const eventName in events) {
                    if (events[eventName] === true) {
                        // High-Priority Alert! Interrupt immediately!
                        playSpatialBeep(1400, 0, 0.4);
                        
                        const translatedEvent = getEventTranslation(eventName);
                        const warningSpeech = getTranslation("caution") + " " + translatedEvent + " " + getTranslation("detected");
                        
                        screenReaderAnnounce(warningSpeech, "assertive");
                        speakText(warningSpeech, 1); // Strict immediate interrupt
                        
                        // Break after first matched event to prevent verbal overlap
                        return;
                    }
                }
            }

            // Real-time scan voice announcers - always update and speak
            if (payload.description) {
                narratorOutput.textContent = payload.description;
                currentTextToRead = payload.description;
                // Cancel any previous scan narration and speak immediately
                if (currentSpeechPriority <= 0) {
                    if (speechSynth.speaking) { speechSynth.cancel(); }
                    speakInProgress = false;
                }
                speakText(payload.description, 0, 0.88, 1.0, 0.85); // Calm scan description
            }

            // Spatial Obstacles mapping
            if (payload.obstacles && payload.obstacles.length > 0) {
                payload.obstacles.forEach((obstacle, i) => {
                    let panVal = 0.0;

                    if (obstacle.position === 'left') {
                        panVal = -1.0;
                        const blip = document.createElement('div');
                        blip.className = 'radar-blip left';
                        blipsHolder.appendChild(blip);
                    } else if (obstacle.position === 'right') {
                        panVal = 1.0;
                        const blip = document.createElement('div');
                        blip.className = 'radar-blip right';
                        blipsHolder.appendChild(blip);
                    } else {
                        panVal = 0.0;
                        const blip = document.createElement('div');
                        blip.className = 'radar-blip center';
                        blipsHolder.appendChild(blip);
                    }

                    setTimeout(() => {
                        const freq = panVal === -1.0 ? 800 : (panVal === 1.0 ? 550 : 300);
                        playSpatialBeep(freq, panVal, 0.25);
                        screenReaderAnnounce(`Obstacle ${obstacle.label} on ${obstacle.position}`);
                    }, i * 300);
                });
            }
        }

        // Voice Synthesis Engine - priority-based non-blocking speech manager
        function speakText(text, priority = 0, rate = null, pitch = null, volume = null) {
            if (!text) return;
            
            // If another speak is running, do not let lower-priority interrupt it
            if (speakInProgress && currentSpeechPriority > priority) {
                return;
            }

            try {
                if (speechSynth.speaking) {
                    speechSynth.cancel();
                }
                
                // Chrome SpeechSynthesis freeze workaround
                if (speechSynth.paused) {
                    speechSynth.resume();
                }
            } catch(e) {
                console.warn(e);
            }

            assistantVisualizer.className = "liki-visualizer speaking";
            speakInProgress = true;
            currentSpeechPriority = priority;
            
            const utterance = new SpeechSynthesisUtterance(text);
            currentUtterance = utterance; // Track latest active utterance
            
            if (rate !== null) utterance.rate = rate;
            if (pitch !== null) utterance.pitch = pitch;
            if (volume !== null) utterance.volume = volume;

            const voices = speechSynth.getVoices();
            const targetLang = supportedLanguages[selectedLanguageKey].code;
            
            let chosenVoice = null;
            for (let i = 0; i < voices.length; i++) {
                if (voices[i].lang.startsWith(targetLang) || voices[i].lang.replace('_', '-').startsWith(targetLang.substring(0, 2))) {
                    if (voices[i].name.toLowerCase().includes('google') || voices[i].name.toLowerCase().includes('natural') || voices[i].name.toLowerCase().includes('female')) {
                        chosenVoice = voices[i];
                        break;
                    }
                }
            }
            if (!chosenVoice) {
                for (let i = 0; i < voices.length; i++) {
                    if (voices[i].lang.startsWith(targetLang) || voices[i].lang.replace('_', '-').startsWith(targetLang.substring(0, 2))) {
                        chosenVoice = voices[i];
                        break;
                    }
                }
            }
            if (chosenVoice) {
                utterance.voice = chosenVoice;
            }

            utterance.onstart = function() {
                if (currentUtterance !== utterance) return;
                waveAnim.style.display = 'flex';
            };

            utterance.onerror = function() {
                if (currentUtterance !== utterance) return;
                speakInProgress = false;
                currentSpeechPriority = 0;
                waveAnim.style.display = 'none';
                assistantVisualizer.className = "liki-visualizer";
            };

            utterance.onend = function() {
                if (currentUtterance !== utterance) return;
                speakInProgress = false;
                currentSpeechPriority = 0;
                waveAnim.style.display = 'none';
                if (onboardingStep === "ready" && isAutoscanActive) {
                    assistantVisualizer.className = "liki-visualizer listening";
                } else {
                    assistantVisualizer.className = "liki-visualizer";
                }
            };

            speechSynth.speak(utterance);
        }

        // Smart Vehicle Danger Helper Functions
        function handleDangerDetected(danger) {
            dangerDetails = danger;
            if (!isDangerActive) {
                isDangerActive = true;
                
                // Cancel current speech immediately
                if (speechSynth.speaking) {
                    speechSynth.cancel();
                }
                speakInProgress = false;
                currentSpeechPriority = 0;
                
                // Clear any old interval
                if (dangerInterval) {
                    clearInterval(dangerInterval);
                }
                
                // Trigger immediately, then every 2 seconds
                triggerDangerAlert();
                dangerInterval = setInterval(triggerDangerAlert, 2000);
            }
        }

        function handleDangerCleared() {
            if (dangerInterval) {
                clearInterval(dangerInterval);
                dangerInterval = null;
            }
            isDangerActive = false;
            dangerDetails = null;
            
            // Cancel current warning speech
            if (speechSynth.speaking) {
                speechSynth.cancel();
            }
            speakInProgress = false;
            currentSpeechPriority = 0;
            
            // Announce safe states at high priority (2) to ensure immediate playback
            const safeText = getDangerTranslation("safe_now") + " " + getDangerTranslation("path_clear");
            speakText(safeText, 2);
        }

        function triggerDangerAlert() {
            if (!isDangerActive || !dangerDetails) {
                if (dangerInterval) {
                    clearInterval(dangerInterval);
                    dangerInterval = null;
                }
                return;
            }

            const direction = dangerDetails.direction; // "left" | "right" | "front" | "behind"
            const distance = dangerDetails.distance; // "far" | "medium" | "close"

            // Compute panning (left = -1, right = 1, front/behind = 0)
            let pan = 0.0;
            if (direction === "left") pan = -1.0;
            else if (direction === "right") pan = 1.0;

            // Audio & speech settings based on distance
            let freq = 1000;
            let duration = 0.35;
            let volume = 0.7;
            let rate = 1.25;
            let pitch = 1.1;

            if (distance === "far") {
                freq = 880;
                duration = 0.3;
                volume = 0.4;
                rate = 0.95;
                pitch = 1.0;
            } else if (distance === "close") {
                freq = 1200;
                duration = 0.4;
                volume = 1.0; // Max volume
                rate = 1.45;
                pitch = 1.2;
            }

            // Play the alert beep
            playSpatialBeep(freq, pan, duration, volume);

            // Construct localized evasion message
            let translationKey = "danger_from_front";
            if (direction === "left") translationKey = "danger_from_left";
            else if (direction === "right") translationKey = "danger_from_right";
            else if (direction === "behind") translationKey = "danger_from_behind";

            const warningText = getTranslation(translationKey);
            
            // Speak warning immediately with priority 2
            speakText(warningText, 2, rate, pitch, volume);
        }

        // FASTER continuous scanning loop
        function triggerFastScanCycle() {
            if (!isAutoscanActive) {
                badgeScan.className = 'badge';
                badgeScan.querySelector('span').textContent = "Scan Offline";
                isScanLoopRunning = false;
                setSystemStatus(false);
                return;
            }
            
            const imgData = snapFrame();
            if (imgData) {
                runAIAnalysis(imgData).finally(() => {
                    // Loop immediately back-to-back
                    setTimeout(triggerFastScanCycle, 10);
                });
            } else {
                setTimeout(triggerFastScanCycle, 200);
            }
        }

        // Voice Onboarding Sequence
        function triggerVoiceOnboarding() {
            onboardingStep = "greeting";
            speakText(getTranslation("welcome"));
            
            setTimeout(() => {
                if (onboardingStep === "greeting") {
                    speakText(getTranslation("language_listed"));
                    onboardingStep = "waiting-language";
                }
            }, 6000);
        }

        // Liki AI Speech Recognition - standard restart flow for 100% wake-word accuracy
        function initHeyLikiRecognition() {
            const SpeechRecog = window.webkitSpeechRecognition || window.SpeechRecognition;
            if (!SpeechRecog) {
                transcriptDisplay.textContent = "Voice control unsupported";
                return;
            }

            recognitionEngine = new SpeechRecog();
            recognitionEngine.continuous = true;
            recognitionEngine.interimResults = true;
            recognitionEngine.maxAlternatives = 3;
            recognitionEngine.lang = "en-US";

            recognitionEngine.onstart = () => {
                isRecognitionRunning = true;
                noSpeechCount = 0; // reset counter on successful start
                document.getElementById('no-speech-msg').style.display = 'none';
                micStatusOrb.className = 'mic-orb recording';
                assistantVisualizer.className = "liki-visualizer listening";
                transcriptDisplay.textContent = "Listening...";
            };

            recognitionEngine.onresult = (e) => {
                let interimTranscript = '';
                let finalTranscript = '';
                let allAlternatives = [];

                for (let i = e.resultIndex; i < e.results.length; ++i) {
                    // Collect all alternatives for logging
                    for (let j = 0; j < e.results[i].length; j++) {
                        allAlternatives.push(e.results[i][j].transcript);
                    }
                    if (e.results[i].isFinal) {
                        finalTranscript += e.results[i][0].transcript;
                    } else {
                        interimTranscript += e.results[i][0].transcript;
                    }
                }

                // Log every single audio input
                if (allAlternatives.length > 0) {
                    console.log('[Liki Heard] Alternatives:', allAlternatives);
                    const heardEl = document.getElementById('mic-heard-text');
                    if (heardEl) heardEl.textContent = 'Heard: ' + allAlternatives.join(' / ');
                }

                const transcriptToProcess = finalTranscript || interimTranscript;
                if (transcriptToProcess) {
                    transcriptDisplay.textContent = transcriptToProcess;
                    // Check all alternatives for wake word
                    let triggered = false;
                    for (const alt of allAlternatives) {
                        processVoiceCommand(alt);
                        if (!triggered) triggered = true;
                    }
                }

                if (finalTranscript) {
                    try { recognitionEngine.stop(); } catch(err) {}
                }
            };

            recognitionEngine.onend = () => {
                isRecognitionRunning = false;
                if (isVoiceRecogActive) {
                    setTimeout(() => {
                        try { recognitionEngine.start(); } catch(err) {}
                    }, 300);
                }
            };

            recognitionEngine.onerror = (e) => {
                isRecognitionRunning = false;
                console.warn("SpeechRecog error: ", e.error);
                if (e.error === 'not-allowed') {
                    isVoiceRecogActive = false;
                    transcriptDisplay.textContent = "Mic access denied. Tap button to retry.";
                    const btn = document.getElementById('fallback-mic-btn');
                    if (btn) btn.style.display = 'block';
                    document.getElementById('no-speech-msg').style.display = 'block';
                } else if (e.error === 'no-speech') {
                    noSpeechCount++;
                    console.log('No speech #' + noSpeechCount + '. Mic may not be picking up audio.');
                    const heardEl = document.getElementById('mic-heard-text');
                    if (heardEl) heardEl.textContent = 'Heard: (silence - no speech detected #' + noSpeechCount + ')';
                    if (noSpeechCount >= 3) {
                        document.getElementById('no-speech-msg').style.display = 'block';
                    }
                }
            };

            try {
                recognitionEngine.start();
            } catch(e) {}

            // Watchdog: auto-restart SpeechRecognition if it goes offline while voice activation is on
            if (!window.speechWatchdog) {
                window.speechWatchdog = setInterval(() => {
                    if (isVoiceRecogActive && !isRecognitionRunning) {
                        console.log("Watchdog: restarting recognition...");
                        try {
                            if (recognitionEngine) {
                                recognitionEngine.start();
                            } else {
                                initHeyLikiRecognition();
                            }
                        } catch (err) {
                            console.log("Watchdog caught start error, re-initializing entirely");
                            initHeyLikiRecognition();
                        }
                    }
                }, 2000);
            }
        }

        function processVoiceCommand(text) {
            const normalizedText = text.toLowerCase().trim();

            // 1. Language Onboarding Flow handler
            if (onboardingStep === "waiting-language" || onboardingStep === "greeting") {
                for (const key in supportedLanguages) {
                    if (normalizedText.includes(key)) {
                        selectedLanguageKey = key;
                        activeLanguageBadge.textContent = "Selected Language: " + supportedLanguages[key].name;
                        onboardingStep = "ready";
                        
                        if (recognitionEngine) {
                            recognitionEngine.stop();
                        }
                        
                        speakText(getTranslation("confirmed"));
                        setTimeout(() => {
                            initHeyLikiRecognition();
                        }, 2000);
                        return;
                    }
                }
            }

            // 2. Main Liki command parser
            const triggerWords = ["hey liki", "हे लीकी", "ஹே லிகி", "ஹேலிகி", "హే లికి", "ಹೇ ಲಿಖಿ", "ഹേ ലികി", "হে লিকি"];
            let hasTrigger = false;
            
            for (const trig of triggerWords) {
                if (normalizedText.includes(trig)) {
                    hasTrigger = true;
                    break;
                }
            }

            if (hasTrigger) {
                playSpatialBeep(900, 0, 0.2);

                // Stop Command
                if (normalizedText.includes("stop") || normalizedText.includes("रुको") || normalizedText.includes("நிறுத்து") || normalizedText.includes("ఆపు") || normalizedText.includes("ನಿಲ್ಲಿಸು") || normalizedText.includes("നിർത്തുക")) {
                    isAutoscanActive = false;
                    if (speechSynth.speaking) {
                        speechSynth.cancel();
                    }
                    speakText(getTranslation("stop"));
                    badgeGpsDest.className = 'badge';
                    badgeGpsDest.querySelector('span').textContent = "Ready";
                    directionsContainer.innerHTML = `
                        <div class="direction-step active-step">
                            <i class="fa-solid fa-location-crosshairs"></i>
                            <div>GPS receiver ready. Say "Hey Liki navigate to [destination]" to initiate directions.</div>
                        </div>
                    `;
                    return;
                }

                // Navigate Command
                if (normalizedText.includes("navigate to") || normalizedText.includes("go to") || normalizedText.includes("मार्गदर्शन") || normalizedText.includes("வழிசெலுத்து") || normalizedText.includes("నావిగేట్ చేయండి") || normalizedText.includes("ಮಾರ್ಗ ತೋರಿಸು") || normalizedText.includes("ನಾവിഗേറ്റ് ചെയ്യുക")) {
                    let destination = "";
                    if (normalizedText.includes("navigate to")) {
                        destination = normalizedText.split("navigate to")[1].trim();
                    } else if (normalizedText.includes("go to")) {
                        destination = normalizedText.split("go to")[1].trim();
                    } else {
                        destination = "your destination";
                    }

                    badgeGpsDest.className = 'badge success-badge';
                    badgeGpsDest.querySelector('span').textContent = destination.substring(0, 15);
                    triggerNavigationRoute(destination);
                    return;
                }

                // Phone Call Command
                if (normalizedText.includes("call") || normalizedText.includes("फ़ोन") || normalizedText.includes("அழைப்பு") || normalizedText.includes("కాల్ చేయండి") || normalizedText.includes("ಕಾಲ್ ಮಾಡು") || normalizedText.includes("വിളിക്കുക")) {
                    let recipient = normalizedText.split("call")[1] || "operator";
                    speakText("Calling " + recipient + " now.");
                    setTimeout(() => {
                        window.open("tel:911", "_self");
                    }, 1500);
                    return;
                }

                // Auto Scan Toggle Command (Liki alone or start)
                isAutoscanActive = true;
                playSpatialBeep(523, 0, 0.25);
                triggerFastScanCycle();
            }
        }

        // Real Google Maps Directions Integration
        let mapInstance = null;
        let directionsService = null;
        let directionsRenderer = null;
        
        function initMap() {
            try {
                const centerLoc = { lat: 28.6139, lng: 77.2090 }; // New Delhi default
                
                directionsService = new google.maps.DirectionsService();
                directionsRenderer = new google.maps.DirectionsRenderer();
                
                mapInstance = new google.maps.Map(document.getElementById("map-canvas"), {
                    zoom: 14,
                    center: centerLoc,
                    disableDefaultUI: true
                });
                
                directionsRenderer.setMap(mapInstance);
                
                // Try to get user current location to center map
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((position) => {
                        const pos = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        mapInstance.setCenter(pos);
                    }, () => {
                        console.log("Maps geolocation center failed, using default.");
                    });
                }
                
                console.log("Real Google Map Rendered.");
            } catch(e) {
                console.warn("Google Maps SDK failed to load. Visual simulation active.", e);
            }
        }

        function triggerNavigationRoute(dest) {
            const calcAnnounce = getTranslation("route_calc") + dest + ". " + getTranslation("route_start");
            speakText(calcAnnounce);
            
            // Try geolocation coordinates for route origin first
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const originLatLng = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        calculateAndDisplayRoute(originLatLng, dest);
                    },
                    (error) => {
                        console.warn("Geolocation failed or denied, using New Delhi default.", error);
                        calculateAndDisplayRoute("New Delhi, India", dest);
                    },
                    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
                );
            } else {
                console.warn("Geolocation not supported by browser, using New Delhi default.");
                calculateAndDisplayRoute("New Delhi, India", dest);
            }
        }

        function calculateAndDisplayRoute(origin, dest) {
            if (directionsService && mapInstance) {
                const request = {
                    origin: origin,
                    destination: dest,
                    travelMode: 'WALKING'
                };
                
                directionsService.route(request, function(result, status) {
                    if (status === 'OK') {
                        directionsRenderer.setDirections(result);
                        
                        // Parse actual turn-by-turn text instructions from directions API
                        const legs = result.routes[0].legs[0].steps;
                        directionsContainer.innerHTML = '';
                        
                        legs.forEach((step, idx) => {
                            const stepText = step.instructions.replace(/<[^>]*>/g, ""); // Strip HTML tags
                            const el = document.createElement('div');
                            el.className = `direction-step ${idx === 0 ? 'active-step' : ''}`;
                            el.innerHTML = `<i class="fa-solid fa-arrow-turn-right"></i><div>${stepText}</div>`;
                            directionsContainer.appendChild(el);
                        });
                        
                        // Verbally announce first three turn steps
                        let currentStepIdx = 0;
                        const routeTimer = setInterval(() => {
                            if (!isVoiceRecogActive || !isAutoscanActive) {
                                clearInterval(routeTimer);
                                return;
                            }
                            if (currentStepIdx < legs.length && currentStepIdx < 3) {
                                const rawAnnounce = legs[currentStepIdx].instructions.replace(/<[^>]*>/g, "");
                                speakText(rawAnnounce);
                                
                                const stepEls = directionsContainer.querySelectorAll('.direction-step');
                                stepEls.forEach((el, index) => {
                                    if (index === currentStepIdx) {
                                        el.classList.add('active-step');
                                    } else {
                                        el.classList.remove('active-step');
                                    }
                                });
                                currentStepIdx++;
                            } else {
                                clearInterval(routeTimer);
                            }
                        }, 8000);
                    } else {
                        // Fallback visually if route not found
                        fallbackRouteVisualizer(dest);
                    }
                });
            } else {
                fallbackRouteVisualizer(dest);
            }
        }

        function fallbackRouteVisualizer(dest) {
            const steps = [
                `Proceed straight ahead toward ${dest}.`,
                "In 20 meters, turn right at the crosswalk.",
                "In 50 meters, keep left to avoid lateral columns.",
                `You have arrived at ${dest}.`
            ];
            
            directionsContainer.innerHTML = '';
            steps.forEach((stepText, idx) => {
                const el = document.createElement('div');
                el.className = `direction-step ${idx === 0 ? 'active-step' : ''}`;
                el.innerHTML = `<i class="fa-solid ${idx === steps.length - 1 ? 'fa-circle-check' : 'fa-arrow-turn-right'}"></i><div>${stepText}</div>`;
                directionsContainer.appendChild(el);
            });

            let currentStep = 0;
            const routeGuidanceTimer = setInterval(() => {
                if (!isVoiceRecogActive) {
                    clearInterval(routeGuidanceTimer);
                    return;
                }
                
                if (currentStep < steps.length) {
                    const activeStepText = steps[currentStep];
                    speakText(activeStepText);
                    
                    const stepEls = directionsContainer.querySelectorAll('.direction-step');
                    stepEls.forEach((el, index) => {
                        if (index === currentStep) {
                            el.classList.add('active-step');
                        } else {
                            el.classList.remove('active-step');
                        }
                    });
                    
                    currentStep++;
                } else {
                    clearInterval(routeGuidanceTimer);
                }
            }, 7500);
        }

        // ── Status indicator helper ──────────────────────────────
        function setSystemStatus(online) {
            const dot = document.getElementById('status-dot');
            const label = document.getElementById('status-label');
            if (online) {
                dot.classList.add('online');
                label.textContent = 'All systems active';
            } else {
                dot.classList.remove('online');
                label.textContent = 'Say Liki to start';
            }
        }

        // ── Master init: starts everything at once ───────────────
        async function initAll() {
            // Set language state
            onboardingStep = 'ready';
            selectedLanguageKey = 'english';
            activeLanguageBadge.textContent = 'Selected Language: English';

            // Start camera
            await startCamera();

            // Start microphone monitoring
            startMicrophoneMonitoring();

            // Start voice recognition
            initHeyLikiRecognition();

            // Auto-activate scanning immediately
            isAutoscanActive = true;
            isScanLoopRunning = true;

            // Wait for camera to be ready (video metadata loaded)
            if (webcam.readyState >= 2) {
                triggerFastScanCycle();
            } else {
                webcam.addEventListener('loadeddata', () => {
                    triggerFastScanCycle();
                }, { once: true });
                // Fallback in case event never fires
                setTimeout(() => {
                    if (isAutoscanActive && isScanLoopRunning && !requestPending) {
                        triggerFastScanCycle();
                    }
                }, 1500);
            }

            setSystemStatus(true);

            // Liki intro speech (calm, informative)
            setTimeout(() => {
                speakText(
                    "I am Liki, your navigation assistant. " +
                    "Scanning has started. " +
                    "Say Liki forward to scan ahead with back camera. " +
                    "Say Liki front to use front camera. " +
                    "Say Liki stop to pause.",
                    0, 0.88, 1.0, 0.9   // calm pace, normal pitch
                );
            }, 700);
        }

        // Translation helpers
        function getTranslation(key) {
            const lang = translations[selectedLanguageKey] || translations["english"];
            const enFallback = translations["english"];
            return (lang && lang[key]) || (enFallback && enFallback[key]) || key;
        }

        function getDangerTranslation(key) {
            const lang = dangerTranslations[selectedLanguageKey] || dangerTranslations["english"];
            const enFallback = dangerTranslations["english"];
            return (lang && lang[key]) || (enFallback && enFallback[key]) || key;
        }

        function getEventTranslation(key) {
            const lang = eventTranslations[selectedLanguageKey] || eventTranslations["english"];
            const enFallback = eventTranslations["english"];
            return (lang && lang[key]) || (enFallback && enFallback[key]) || key;
        }

        // Auto-start wake word listener on page load — no button needed
        window.addEventListener('DOMContentLoaded', () => {
            // Instantly speak welcome message
            try {
                const utterance = new SpeechSynthesisUtterance("Hello! I am Liki. Say Liki to activate me.");
                utterance.lang = "en-US";
                utterance.rate = 0.9;
                utterance.pitch = 1.0;
                window.speechSynthesis.speak(utterance);
            } catch (e) {
                console.warn("Direct speech synthesis failed on load:", e);
            }

            // Immediately start listening for "Liki" wake word
            initHeyLikiRecognition();
            startCamera(); // Auto start camera on page load
            // Show the status indicator as offline until activated
            setSystemStatus(false);
            
            // Add a document fallback click listener for speech in case of strict autoplay policies
            document.body.addEventListener('click', function firstClickSpeak() {
                try {
                    const fallbackUtterance = new SpeechSynthesisUtterance("Liki is ready.");
                    window.speechSynthesis.speak(fallbackUtterance);
                } catch(e) {}
                document.body.removeEventListener('click', firstClickSpeak);
            }, { once: true });
        });

        if (speechSynth.onvoiceschanged !== undefined) {
            speechSynth.onvoiceschanged = () => {
                console.log("Speech voices updated.");
            };
        }

        // activateVoiceNow() replaced by wake-word auto-activation
        function retryMicPermission() {
            isVoiceRecogActive = true;
            noSpeechCount = 0;
            const btn = document.getElementById('fallback-mic-btn');
            if (btn) btn.style.display = 'none';
            const msg = document.getElementById('no-speech-msg');
            if (msg) msg.style.display = 'none';
            const heardEl = document.getElementById('mic-heard-text');
            if (heardEl) heardEl.textContent = 'Heard: (restarting...)';
            
            initHeyLikiRecognition();
            startCamera();
        }

        let micTestContext = null;
        let micTestStream = null;

        async function populateMicDropdown() {
            try {
                // Request temporary access just to get labels if needed
                await navigator.mediaDevices.getUserMedia({ audio: true });
                const devices = await navigator.mediaDevices.enumerateDevices();
                const audioDevices = devices.filter(device => device.kind === 'audioinput');
                const selector = document.getElementById('mic-selector');
                if (!selector) return;
                
                selector.innerHTML = '';
                if (audioDevices.length === 0) {
                    selector.innerHTML = '<option value="">No microphones found</option>';
                    return;
                }
                
                audioDevices.forEach(device => {
                    const option = document.createElement('option');
                    option.value = device.deviceId;
                    option.text = device.label || `Microphone ${selector.length + 1}`;
                    selector.appendChild(option);
                });
            } catch (err) {
                console.warn("Could not enumerate devices:", err);
                const selector = document.getElementById('mic-selector');
                if (selector) selector.innerHTML = '<option value="">Permission needed to list mics</option>';
            }
        }
        
        // --- HARDWARE TRIGGERS (SHAKE & MEDIA KEYS) ---
        function setupHardwareTriggers() {
            // 1. Shake Detection
            let lastShake = 0;
            window.addEventListener('devicemotion', (e) => {
                const acc = e.accelerationIncludingGravity;
                if (!acc) return;
                const force = Math.abs(acc.x) + Math.abs(acc.y) + Math.abs(acc.z);
                if (force > 30) { // Hard shake threshold
                    const now = Date.now();
                    if (now - lastShake > 2000) {
                        lastShake = now;
                        console.log("Device Shaken!");
                        processVoiceCommand("help");
                    }
                }
            });

            // Request permission on iOS for accelerometer when user interacts
            document.body.addEventListener('click', async () => {
                if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
                    try { await DeviceMotionEvent.requestPermission(); } catch(e) {}
                }
            }, { once: true });

            // 2. Volume/Media Button Interception (MediaSession)
            // We need a silent audio playing to hijack media keys
            const silentAudio = new Audio();
            // 1-second silent WAV base64
            silentAudio.src = "data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA=="; 
            silentAudio.loop = true;
            
            // Try to play on first interaction to avoid autoplay policies
            document.body.addEventListener('click', () => {
                silentAudio.play().catch(e=>{});
            }, { once: true });

            if ('mediaSession' in navigator) {
                navigator.mediaSession.metadata = new MediaMetadata({ title: 'Liki Assistant Active' });
                
                // Map Prev Track / Vol Down to STOP
                navigator.mediaSession.setActionHandler('previoustrack', () => {
                    console.log("Media Key: Previous Track (Stop)");
                    processVoiceCommand("stop");
                });
                
                // Map Next Track / Vol Up to SCAN
                navigator.mediaSession.setActionHandler('nexttrack', () => {
                    console.log("Media Key: Next Track (Scan)");
                    processVoiceCommand("scan");
                });
            }
        }
        
        // Populate on load and setup hardware triggers
        window.addEventListener('DOMContentLoaded', () => {
            populateMicDropdown();
            setupHardwareTriggers();
        });

        async function startMicTest() {
            const btn = document.getElementById('mic-test-btn');
            const volBar = document.getElementById('mic-vol-bar');
            const volLabel = document.getElementById('mic-vol-label');
            const selector = document.getElementById('mic-selector');
            
            if (micTestStream) {
                // Stop test
                micTestStream.getTracks().forEach(t => t.stop());
                micTestStream = null;
                if (micTestContext) {
                    micTestContext.close();
                    micTestContext = null;
                }
                btn.innerHTML = '<i class="fa-solid fa-microphone"></i> Test Mic';
                btn.style.background = 'var(--primary,#00f2fe)';
                volBar.style.width = '0%';
                volLabel.textContent = '0%';
                return;
            }

            try {
                btn.innerHTML = '<i class="fa-solid fa-stop"></i> Stop Test';
                btn.style.background = '#ff4444';
                
                let constraints = { audio: true, video: false };
                if (selector && selector.value) {
                    constraints.audio = { deviceId: { exact: selector.value } };
                }
                
                micTestStream = await navigator.mediaDevices.getUserMedia(constraints);
                micTestContext = new (window.AudioContext || window.webkitAudioContext)();
                
                const source = micTestContext.createMediaStreamSource(micTestStream);
                const analyser = micTestContext.createAnalyser();
                analyser.fftSize = 256;
                source.connect(analyser);
                
                const dataArray = new Uint8Array(analyser.frequencyBinCount);
                
                function updateVolume() {
                    if (!micTestStream) return;
                    analyser.getByteFrequencyData(dataArray);
                    
                    let sum = 0;
                    for (let i = 0; i < dataArray.length; i++) {
                        sum += dataArray[i];
                    }
                    let avg = sum / dataArray.length;
                    
                    // Normalize average (0-255) to percentage (0-100), maybe boost it a bit for visibility
                    let pct = Math.min(100, Math.round((avg / 255) * 100 * 2.5));
                    
                    volBar.style.width = pct + '%';
                    volLabel.textContent = pct + '%';
                    
                    requestAnimationFrame(updateVolume);
                }
                updateVolume();
                
            } catch (err) {
                console.error("Mic test error:", err);
                alert("Failed to access microphone for test: " + err.message);
                btn.innerHTML = '<i class="fa-solid fa-microphone"></i> Test Mic';
                btn.style.background = 'var(--primary,#00f2fe)';
            }
        }
    