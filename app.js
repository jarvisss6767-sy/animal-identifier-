const video = document.getElementById('webcam');
const scanBtn = document.getElementById('scan-btn');
const resultCard = document.getElementById('result-card');
const creatureName = document.getElementById('creature-name');
const scientificName = document.getElementById('scientific-name');
const creatureDesc = document.getElementById('creature-description');
const canvas = document.getElementById('photo-canvas');

// 1. Activate the phone's back camera automatically
navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(stream => { video.srcObject = stream; })
    .catch(err => { alert("Please allow camera access to scan creatures."); });

// 2. Capture photo and send to iNaturalist Free Computer Vision API
scanBtn.addEventListener('click', () => {
    resultCard.classList.remove('hidden');
    creatureName.innerText = "Analyzing creature...";
    scientificName.innerText = "";
    creatureDesc.innerText = "Running visual recognition...";

    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
        const formData = new FormData();
        formData.append('image', blob, 'creature.jpg');

        // Fetching identification data completely for free
        fetch('https://inaturalist.org', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if(data.results && data.results.length > 0) {
                const topMatch = data.results[0].taxon;
                creatureName.innerText = topMatch.preferred_common_name || topMatch.name;
                scientificName.innerText = `Scientific Name: ${topMatch.name}`;
                
                // Fetch extra data from Free Wikipedia API seamlessly
                fetch(`https://wikipedia.org{topMatch.name}`)
                    .then(res => res.json())
                    .then(wiki => {
                        creatureDesc.innerText = wiki.extract || "No extra encyclopedia details found, but species is confirmed!";
                    });
            } else {
                creatureName.innerText = "Unknown Creature";
                creatureDesc.innerText = "Could not identify. Try getting closer and clearing up the blur.";
            }
        })
        .catch(err => {
            creatureName.innerText = "Scan Error";
            creatureDesc.innerText = "Ensure you are connected to the internet.";
        });
    }, 'image/jpeg');
});
