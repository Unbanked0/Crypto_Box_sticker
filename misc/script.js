// Vérification du protocole
if (window.location.protocol === 'file:') {
    console.warn("Attention : Ce script doit être exécuté sur un serveur web pour fonctionner correctement. Les fonctionnalités de génération d'image peuvent ne pas fonctionner en local. Si besoin utilisez Simple Web Server sur votre ordinateur : https://simplewebserver.org/");
}

const cryptoConfig = {
    monero: {
        name: "Monero",
        logo: "img/xmr_logo.png",
        addressRegex: /^[1-9A-HJ-NP-Za-km-z]{95}$/,
        addressLength: 95,
		tutorialLink: "https://youtu.be/e7dywiZIpWg&t=8"
    },
    bitcoin: {
        name: "Bitcoin",
        logo: "img/btc_logo.png",
        addressRegex: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^(bc1)[0-9A-Za-z]{39,59}$/,
        addressLength: null,   /* 42 or X caracters. Example : bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh  */
		tutorialLink: "https://bitcoin.fr"
    },
    june: {
        name: "June Ğ1",
        logo: "img/june_XG1_logo.png",
        addressRegex: /^[A-Za-z0-9]{43,44}$/,
        addressLength: null,
		/* 43 or 44 caracters. 
		Example : TENGx7WtzFsTXwnbrPEvb6odX2WnqYcnnrjiiLvp1mS  ou 78ZwwgpgdH5uLZLbThUQH7LKwPgjMunYfLiCfUCySkM8 */
		tutorialLink: "https://monnaie-libre.fr"
    }
};

// Examples of sovereign crypto addresses, for instant testing. 
const exampleAddresses = {
    // CCS fund for supporting Monero projects : https://ccs.getmonero.org/donate/
	monero: "888tNkZrPN6JsEgekjMnABU4TBzc2Dt29EPAvkRxbANsAnjyPbb3iQ1YBRk1UXcdRsiKc9dhwMVgN5S9cQUiyoogDavup3H",
	
	// Internet Archive fund ! https://archive.org/donate/cryptocurrency/
	bitcoin : "1Archive1n2C579dMsAu3iC6tWzuQJz8dN",
	/* a random address (no Bitcoin.org fund ?) 
    bitcoin: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",  */
	
	// June funding : monnaie-libre.fr 
    june: "78ZwwgpgdH5uLZLbThUQH7LKwPgjMunYfLiCfUCySkM8"
	// June 2 (miners) : :  "TENGx7WtzFsTXwnbrPEvb6odX2WnqYcnnrjiiLvp1mS"
};

let fullAddress = '';
let addressValidated = false;
let selectedCrypto = 'monero';

function isValidAddress(address, config) {
    if (config.addressLength && address.length !== config.addressLength) {
        return false;
    }
    return config.addressRegex.test(address);
}

function validateAddress() {
    const address = document.getElementById('cryptoAddress').value;
    const config = cryptoConfig[selectedCrypto];
    const validationMessage = document.getElementById('addressValidationMessage');

    if (address === '') {
        validationMessage.textContent = '';
        validationMessage.style.color = 'gray';
        addressValidated = false;
        toggleMobileText(false);
    } else if (isValidAddress(address, config)) {
        validationMessage.textContent = 'Adresse de réception correcte';
        validationMessage.style.color = 'green';
        addressValidated = true;
        toggleMobileText(true);
    } else {
        validationMessage.textContent = 'Adresse incorrecte';
        validationMessage.style.color = 'red';
        addressValidated = false;
        toggleMobileText(false);
    }
    generateBanner();
}

function fillExampleAddress() {
    const addressInput = document.getElementById('cryptoAddress');
    addressInput.value = exampleAddresses[selectedCrypto];
    validateAddress();
}



async function generateQRCode(text, options = {}) {
    console.log("Génération du QR code...");
    const canvas = document.createElement('canvas');
    return new Promise((resolve, reject) => {
        // For 100px :   QRCode.toCanvas(canvas, text, options, function (error) {
        QRCode.toCanvas(canvas, text, { width: 100, height: 100, ...options }, function (error) {
            if (error) {
                console.error("Erreur lors de la génération du QR code:", error);
                reject(error);
            } else {
                console.log("QR code généré avec succès");
                resolve(canvas);
            }
        });
    });
}


async function generateBanner() {
    console.log("Génération de la bannière...");
    const address = document.getElementById('cryptoAddress').value;
    const name = document.getElementById('contact-name').value;
    const config = cryptoConfig[selectedCrypto];
    const designType = document.querySelector('input[name="design"]:checked').value;
    fullAddress = address;

    const bannerElement = document.getElementById('banner');
    if (!bannerElement) {
        console.error("L'élément 'banner' n'existe pas dans le DOM");
        return;
    }

    /* Debug */
    const shortAddress3 = document.getElementById("shortAddress3");
    if (shortAddress3) {
        // console.error("L'élément 'shortAddress est OK !");
    } else {
        // console.error("L'élément 'shortAddress' n'existe pas dans le DOM");
    }


    const cryptoNameElement = document.getElementById('cryptoName');
    /* DEBUG */
    /*
    const cryptoNameElement = document.getElementById('cryptoName');
    const cryptoName2Element = document.getElementById('cryptoName2');

    if (cryptoNameElement) {
        cryptoNameElement.textContent = config.name;
        console.log("cryptoName existe");
    }
    else {console.log("cryptoName est KO");}
    if (cryptoName2Element) {
        cryptoName2Element.textContent = config.name;
        console.log("cryptoName2 existe");
    }
    */

    try {
        const qrContainer = document.getElementById("qrcode");
        qrContainer.innerHTML = '';

        if (addressValidated) {  // force name :   && name.trim() !== '')  
            if (designType !== 'minimal') {
                //const qrCanvas = await generateQRCode(address, { width: 100, height: 100});
                const qrCanvas = await generateQRCode(address, { width: 100, height: 100});
                if (designType === 'withLogo') {
                    const ctx = qrCanvas.getContext('2d');
                    const logo = new Image();
                    logo.onload = () => {
                        const size = qrCanvas.width * 0.24;
                        const x = (qrCanvas.width - size) / 2;
                        const y = (qrCanvas.height - size) / 2;
                        ctx.drawImage(logo, x, y, size, size);
                    };
                    logo.src = config.logo;
                }
                qrContainer.appendChild(qrCanvas);

                // prevent DOM not loaded
                if (cryptoNameElement) {
                    cryptoNameElement.textContent = config.name;
                    console.log("cryptoName existe");   }
                document.getElementById('cryptoName2').textContent = config.name;
                document.getElementById('cryptoLogo').src = config.logo;
                document.getElementById('banner').style.display = 'block';
                
                updateBannerText(); 

                // Mise à jour du texte avec le nom
                document.getElementById('todoText').innerHTML = `Copiez l'adresse pour en envoyer à : <b>${name}</b> `;
       

            } else {
                qrContainer.innerHTML = '<button onclick="showQRPopup()">Afficher le QR Code</button>';
            }
            document.getElementById('shortAddress').value = `${address.substring(0, 9)}...${address.substring(address.length - 7)}`;
        } else {
            qrContainer.innerHTML = '<div id="qrPlaceholder">Renseignez les champs</div>';
            document.getElementById('shortAddress').value = '';
        }

        // avoid DOM not loaded
        if (cryptoNameElement) {
            cryptoNameElement.textContent = config.name;
            console.log("cryptoName existe");   }

        document.getElementById('cryptoName2').textContent = config.name;
        document.getElementById('cryptoLogo').src = config.logo;
        document.getElementById('banner').style.display = 'block';
        
        const elementsToToggle = [
            document.getElementById('saveButton'),
            document.getElementById('textSc'),
            document.getElementById('copyImageButton'),
            document.getElementById('printBannerButton'),
            document.getElementById('integrationFields')
        ];
        elementsToToggle.forEach(el => {
            if (el) el.style.display = addressValidated ? 'block' : 'none';
        });
        
        console.log("Bannière générée avec succès");
        if (addressValidated) {
            updateIntegrationCode();
        }

    } catch (error) {
        console.error("Erreur lors de la génération de la bannière:", error);
        alert("Erreur lors de la génération de la bannière: " + error);
    }
}

function createProgressiveBanner() {
    console.log("Création de la bannière progressive...");
    const bannerDiv = document.createElement('div');
    bannerDiv.style.cssText = `
        width: 600px; height: 300px; background-color: #ff6600; color: white;
        padding: 20px; box-sizing: border-box; position: relative; font-family: Arial, sans-serif;
    `;

    const content = `
        <h2 style="margin: 0 0 10px 280px;">Don en crypto</h2>
        <p style="margin: 0 0 10px 280px;">Copiez l'adresse pour envoyer du ${cryptoConfig[selectedCrypto].name}</p>
        <div style="background-color: #f0f0f0; color: black; padding: 5px; margin: 0 0 10px 280px; width: 280px;">
            ${document.getElementById('shortAddress').value}
        </div>
        <p style="margin: 0 0 10px 280px;">Comment acheter ou envoyer du ${cryptoConfig[selectedCrypto].name} ?</p>
        <img src="${cryptoConfig[selectedCrypto].logo}" style="position: absolute; right: 20px; bottom: 20px; width: 40px; height: 40px;">
    `;
    bannerDiv.innerHTML = content;

    const qrCode = document.querySelector("#qrcode canvas");
    if (qrCode) {
        const qrCodeImg = document.createElement('img');
        qrCodeImg.src = qrCode.toDataURL();
        qrCodeImg.style.cssText = 'position: absolute; left: 20px; top: 20px; width: 260px; height: 260px;';
        bannerDiv.appendChild(qrCodeImg);
    }

    document.body.appendChild(bannerDiv);

    html2canvas(bannerDiv, { useCORS: true }).then(canvas => {
        console.log("Bannière convertie en canvas");
        downloadBanner(canvas);
        document.body.removeChild(bannerDiv);
    }).catch(error => {
        console.error("Erreur lors de la conversion de la bannière:", error);
        alert("Erreur lors de la création de la bannière: " + error);
        document.body.removeChild(bannerDiv);
    });
}

function downloadBanner(canvas) {
    console.log("Téléchargement de la bannière...");
    try {
        const link = document.createElement('a');
        link.download = 'banniere_don_crypto.png';
        link.href = canvas.toDataURL("image/png");
        link.click();
        console.log("Téléchargement de la bannière initié");
    } catch (error) {
        console.error("Erreur lors du téléchargement de la bannière:", error);
        alert("Erreur lors du téléchargement de la bannière: " + error);
    }
}

function downloadQRCode() {
    const cryptoTickers = {
        'monero': 'monero',
        'bitcoin': 'bitcoin',
        'june': 'june'
    };

    const ticker = cryptoTickers[selectedCrypto] || 'crypto';
    const fileName = `banner-${ticker}.png`;

    createBannerImage().then(canvas => {
        const link = document.createElement('a');
        link.download = fileName;
        link.href = canvas.toDataURL("image/png");
        link.click();
    }).catch(err => {
        console.error("Erreur lors de la création de l'image :", err);
        alert("Impossible de créer l'image de la bannière.");
    });
}

function updateCryptoSelection(crypto) {
    selectedCrypto = crypto;
    const config = cryptoConfig[crypto];
    
    // Update banner background
    const banner = document.getElementById('banner');
    banner.className = crypto;  // This will apply the corresponding CSS class

    // Update crypto logo
    const cryptoLogo = document.getElementById('cryptoLogo');
    cryptoLogo.src = config.logo;

    // Update crypto name
    const cryptoNameElements = document.querySelectorAll('#cryptoName, #cryptoName2');
    cryptoNameElements.forEach(el => el.textContent = config.name);

    // Update address placeholder
    const addressInput = document.getElementById('cryptoAddress');
    addressInput.value = '';
    addressInput.placeholder = `Adresse ${config.name}`;

    // Update tutorial link
	const tutorialLink = document.getElementById('tutorialLink');
    tutorialLink.textContent = `Pas d'adresse ${config.name} ? Suivez le tuto en 5 min`;
    tutorialLink.href = config.tutorialLink;

	// Example address
	document.getElementById('exampleAddress').textContent = `Exemple ${cryptoConfig[crypto].name}`;

    // Clear QR code
    const qrContainer = document.getElementById("qrcode");
    qrContainer.innerHTML = '<div id="qrPlaceholder">Renseignez les champs</div>';
    toggleMobileText(false);

    // Show empty banner
    document.getElementById('banner').style.display = 'block';

    // Hide elements that require a valid address
    const elementsToHide = [
        document.getElementById('saveButton'),
        document.getElementById('textSc'),
        document.getElementById('copyImageButton'),
        document.getElementById('printBannerButton'),
        document.getElementById('integrationFields')
    ];
    elementsToHide.forEach(el => {
        if (el) el.style.display = 'none';
    });

    // Validate address (this will clear any previous validation message)
    validateAddress();

    // Update active state of crypto buttons
    document.querySelectorAll('.crypto-button').forEach(button => {
        button.classList.toggle('active', button.dataset.crypto === crypto);
    });


   updateBannerPurpose();

    // Generate banner to show the empty state
    generateBanner();
}


function updateBannerText() {
    const name = document.getElementById('contact-name').value.trim();
    const url = document.getElementById('contact-url').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const todoTextElement = document.getElementById('todoText');
    const todoTextDetailsElement = document.getElementById('todoTextDetails');

    let linkText = '';
    let linkHref = '';

    if (url) {
        linkText = '(lien)';
        linkHref = url.startsWith('http') ? url : 'http://' + url;
    } else if (email) {
        linkText = '(email)';
        linkHref = 'mailto:' + email;
    }

    todoTextElement.textContent = "Copiez l'adresse pour en envoyer à :";
    
    if (name) {
        todoTextDetailsElement.innerHTML = `<b>${name}</b>`;
        if (linkText) {
            todoTextDetailsElement.innerHTML += ` <a href="${linkHref}" target="_blank" style="color: white;">${linkText}</a>`;
        }
    } else {
        todoTextDetailsElement.innerHTML = "&nbsp;"; // Espace insécable pour maintenir la hauteur
    }
}


function updateBannerPurpose() {
    const purpose = document.querySelector('input[name="purpose"]:checked').value;
    const widgetTitle = document.querySelector('#widgetText h2');
    if (!widgetTitle) {
        console.error("L'élément titre du widget n'existe pas dans le DOM");
        return;
    }
    const cryptoName = cryptoConfig[selectedCrypto].name;
 
    if (purpose === 'donation') {
        widgetTitle.textContent = `Don en crypto ${cryptoName}`;
    } else {
        widgetTitle.textContent = `Payer en crypto ${cryptoName}`;
    }
}


/* Ajout champ integration web */


function generateIntegrationCode() {
    const cryptoName = cryptoConfig[selectedCrypto].name;
    const cryptoAddress = document.getElementById('cryptoAddress').value;
    const shortAddress = document.getElementById('shortAddress').value;
    const withDetection = document.querySelector('input[name="pic-detection"]:checked').value === "yes";

    let purchaseURL = "bank-exit.org/buy/";
    let bannerImage = `banner-${selectedCrypto}.png`;
    let zoomFactor = 1.5;
    let bannerWidth = 330 * zoomFactor;
    let bannerHeight = 120 * zoomFactor;

    let shortAddressStyle, purchaseCryptoStyle, infoButtonStyle;

    // donation-input   not responsive
    shortAddressStyle = `left: 37%; bottom: ${24 * zoomFactor}px; width: 41%; padding: 5px; background-color: rgba(241, 136, 51, 0.95); font-size: ${11 * zoomFactor}px; border: 1px solid #FFF;`;
    // donation-link
    purchaseCryptoStyle = `left: 38%; bottom: ${6 * zoomFactor}px; font-size: ${10 * zoomFactor}px;`;

    switch(selectedCrypto) {

        case 'monero':
            purchaseURL = "https://getmonero.org/";
            break; 
        case 'bitcoin':
            purchaseURL = "https://bitcoin.org/";
            break;
        case 'june':
            shortAddressStyle = `left: 37%; bottom: ${24 * zoomFactor}px; width: 41%; padding: 5px; background-color: rgba(142, 200, 233, 0.95); font-size: ${11 * zoomFactor}px; border: 1px solid #FFF;`;
            purchaseCryptoStyle = `left: 38%; bottom: ${6 * zoomFactor}px; font-size: ${10 * zoomFactor}px;`;
            purchaseURL = "https://monnaie-libre.fr/";
            break; 

        default:

    }

    infoButtonStyle = `position: absolute; bottom: ${7 * zoomFactor}px; right: ${50* zoomFactor}px; width: ${12 * zoomFactor}px; height: ${12 * zoomFactor}px; opacity: 0.4; z-index: 10;`;

    let textIntegration = `
    <!--- Crypto donation box -->
    <style>
        .donation-widget {
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 10px;
            width: 100%;
            min-width: ${bannerWidth}px;
        }
        .crypto-donation-box {
            position: relative;
            width: ${bannerWidth}px;
            height: ${bannerHeight}px;
            background-image: url('./crypto-donation-box/${bannerImage}');
            background-size: cover;
            border-radius: ${22.5 * zoomFactor}px ${75 * zoomFactor}px ${75 * zoomFactor}px ${22.5 * zoomFactor}px;
        }
        .donation-link {
            font-size: 15px !important;
            font-family: Arial;
        }

        #mobile-text {
            display: none;
            position: absolute;
            top: 40px;
            left: 40px;
            width: ${zoomFactor * 125}px;
            height: ${zoomFactor * 125}px;
            background-color: rgba(113, 180, 87, 0.97);
            color: white;
            justify-content: center;
            align-items: center;
            text-align: center;
            font-size: ${zoomFactor * 20}px;
            padding: 9px;
            box-sizing: border-box;
            font-family: Arial;
            margin: 12px;
            border-radius: 7.5px;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }

        .donation-input:hover {
            background-color: rgba(241, 156, 81, 0.85);
        }
        .donation-link:hover {
            color: #ffffff;
        }
        #infoButton:hover {
            opacity: 0.8;
        }
        
        /*  For printing */
        @media screen and (max-width: 980px) {
            #mobile-text:not(.hidden) {
                display: flex !important;
            }
        }

        /* Cacher spécifiquement pour l'impression */
        @media print {
            #mobile-text {
                display: none !important;
            }
        }

            /*  Not under 980px */
        @media (max-width: 980px) {
            .donation-widget {
                width: ${1.6*bannerWidth}px !important;
                height:  ${1.6*bannerHeight}px !important;
                margin-left : 5px !important;
            }
            .crypto-donation-box {
                width: ${1.6*bannerWidth}px !important;
                height:  ${1.6*bannerHeight}px !important;
                top : 25%;
            }  
            .donation-input{
              bottom: ${37 * zoomFactor}px !important;
              font-size : ${19 * zoomFactor}px !important;
            }
            .donation-link {
             font-size: ${1.6 * 15}px !important;
            }
            #infoButton {
              bottom : ${1.6 * 12}px !important;
              width : ${ 1.6 * 17}px !important;
              right : ${ 1.6 * 75}px !important;
            }

            /* #mobile-text:not(.hidden) {
                display: flex !important;
            }  */

            .donation-input:hover {
                background-color: rgba(241, 156, 81, 0.85);
            }
            .donation-link:hover {
                color: #ffffff;
            }
            #infoButton:hover {
                opacity: 0.8;
            }

        }
    </style>
    <div class="donation-widget">
        <div class="crypto-donation-box">
            <input type="text" class="donation-input" id="shortAddress" value="${shortAddress}" readonly onclick="toggleAddress()"; cursor: pointer; style="position: absolute; ${shortAddressStyle}  color: white; border-radius: ${4 * zoomFactor}px; text-align: center; z-index: 2;">
            
            <a href="${purchaseURL}" class="donation-link" style="position: absolute; ${purchaseCryptoStyle} color: #ffe8d7; text-decoration: none; z-index: 2;">Comment obtenir du ${cryptoName} ?</a>
            <a href="#" id="infoButton" onclick="openInfoInNewTab(event)" style="${infoButtonStyle}">
                <svg viewBox="0 0 24 24" fill="white">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                </svg>
            </a>
            <div id="mobile-text" onclick="handleMobileTextClick()">Cliquez pour copier et ouvrir votre wallet</div>
        </div>
    </div>
    
`;



    if (withDetection) {
        textIntegration += `
    <style>
    .crypto-donation-box::before {content: "L'image de fond n'a pas pu être chargée. Merci de la télécharger et l'inclure dans le dossier '/crypto-donation-box/${bannerImage}' de votre site. Adresse crypto :"; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: #b17a7a; color: white; display: flex; justify-content: center; align-items: center; text-align: center; padding: ${12 * zoomFactor}px; font-size: ${14 * zoomFactor}px; z-index: 1; opacity: 0; transition: opacity 0.3s; border-radius: ${22.5 * zoomFactor}px ${75 * zoomFactor}px ${75 * zoomFactor}px ${22.5 * zoomFactor}px;}
    .crypto-donation-box.image-error::before {opacity: 1;}
    .crypto-donation-box.image-error { font-family: Arial, sans-serif; }  
    </style>

    <script>
    let fullAddress = '${cryptoAddress}';
    
    function toggleAddress() {
        const shortAddressElement = document.getElementById('shortAddress');
        
        navigator.clipboard.writeText(fullAddress).then(() => {
            console.log('Adresse complète copiée dans le presse-papiers');
            
            const originalValue = shortAddressElement.value;
            shortAddressElement.value = "- Adresse copiée ! -";
            
            setTimeout(() => {
                if (originalValue === fullAddress) {
                    shortAddressElement.value = \`\${fullAddress.substring(0, 9)}...\${fullAddress.substring(fullAddress.length - 7)}\`;
                } else {
                    shortAddressElement.value = fullAddress;
                }
            }, 1000);
        }).catch(err => {
            console.error('Erreur lors de la copie de l\\'adresse :', err);
            if (shortAddressElement.value === fullAddress) {
                shortAddressElement.value = \`\${fullAddress.substring(0, 9)}...\${fullAddress.substring(fullAddress.length - 7)}\`;
            } else {
                shortAddressElement.value = fullAddress;
            }
        });
    }

    function toggleMobileText(show) {
        const mobileText = document.getElementById('mobile-text');
        if (mobileText) {
            mobileText.style.display = show ? 'flex' : 'none';
        }
    }

    function handleMobileTextClick() {
        const shortAddress = document.getElementById('shortAddress').value;
        const mobileText = document.getElementById('mobile-text');

        navigator.clipboard.writeText(shortAddress)
            .then(() => {
                mobileText.textContent = 'Copiée ! Ouverture....';

                setTimeout(() => {
                    mobileText.textContent = 'Cliquez pour copier et ouvrir votre wallet';
                    openMoneroWalletOrCakeWallet();
                }, 1500);
            })
            .catch(err => {
                console.error('Erreur lors de la copie :', err);
            });
    }

    function openInfoInNewTab(event) {
        event.preventDefault(); // Empêche le comportement par défaut du lien
        var url = "https://github.com/Unbanked0/Crypto-Donation-Box1";
        window.open(url, '_blank', 'noopener,noreferrer');
    }

    function openMoneroWalletOrCakeWallet() {
        const moneroScheme = 'monero://open';
        const cakeWalletUrl = 'https://cakewallet.com';

        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        iframe.src = moneroScheme;

        setTimeout(() => {
            document.body.removeChild(iframe);
            if (document.visibilityState !== 'hidden') {
                window.open(cakeWalletUrl, '_blank');
            }
        }, 500);
    }

    // Initialize mobile text visibility
    toggleMobileText(false);

    // Check screen size and toggle mobile text accordingly
    function checkScreenSize() {
        if (window.innerWidth <= 768) {
            toggleMobileText(true);
        } else {
            toggleMobileText(false);
        }
    }

    // Initial check
    checkScreenSize();

    // Listen for window resize events
    window.addEventListener('resize', checkScreenSize);
 
    window.addEventListener('load', function() {
        var donationBox = document.querySelector('.crypto-donation-box');
        var img = new Image();
        img.onload = function() {console.log("Background picture '${bannerImage}' loaded OK");};
        img.onerror = function() {donationBox.classList.add('image-error'); console.log("Background picture '${bannerImage}' is missing");};
        img.src = './crypto-donation-box/${bannerImage}';
    });
    </script>
    `;
    }

    return textIntegration;
}


/* Basic banner copy all 
function createBannerImage() {
    const bannerElement = document.getElementById('banner');
    return html2canvas(bannerElement, {
        willReadFrequently: true
    });
} */

/* Warning! : don't try to make the banner transparent with corners : nearly impossible with QRcode canvas, not displaying anymore. */
function createBannerImage() {
    const bannerElement = document.getElementById('banner');
    
    // Éléments à cacher
    const mobileText = document.getElementById('mobile-text');
    const purchaseCrypto = document.getElementById('purchaseCrypto');
    const infoButton = document.getElementById('infoButton');
    
    // Sauvegarder l'état actuel de visibilité
    const mobileTextDisplay = mobileText.style.display;
    const purchaseCryptoDisplay = purchaseCrypto.style.display;
    const infoButtonDisplay = infoButton.style.display;
    
    // Cacher les éléments
    mobileText.style.display = 'none';
    purchaseCrypto.style.display = 'none';
    infoButton.style.display = 'none';
    
    return html2canvas(bannerElement, {
        willReadFrequently: true
    }).then(canvas => {
        // Restaurer l'état de visibilité des éléments
        mobileText.style.display = mobileTextDisplay;
        purchaseCrypto.style.display = purchaseCryptoDisplay;
        infoButton.style.display = infoButtonDisplay;
        
        return canvas;
    }).catch(error => {
        // En cas d'erreur, restaurer également l'état de visibilité
        mobileText.style.display = mobileTextDisplay;
        purchaseCrypto.style.display = purchaseCryptoDisplay;
        infoButton.style.display = infoButtonDisplay;
        
        throw error;
    });
}



async function copyImageToClipboard() {
    const bannerElement = document.getElementById('banner');
    if (!bannerElement) {
        alert("Veuillez d'abord générer une bannière.");
        return;
    }

    try {
        const canvas = await createBannerImage();
        canvas.toBlob(async (blob) => {
            try {
                await navigator.clipboard.write([
                    new ClipboardItem({ "image/png": blob })
                ]);
                showCopyFeedback();
            } catch (err) {
                console.error("Erreur lors de la copie de l'image :", err);
                alert("Impossible de copier l'image. Votre navigateur ne supporte peut-être pas cette fonctionnalité.");
            }
        });
    } catch (err) {
        console.error("Erreur lors de la création de l'image :", err);
        alert("Impossible de créer l'image de la bannière.");
    }
}


function showCopyFeedback() {
    const feedback = document.getElementById('copyFeedback');
    feedback.classList.add('show');
    setTimeout(() => {
        feedback.classList.remove('show');
    }, 2000);
}


function updateIntegrationCode() {
    const htmlIntegration = document.getElementById('htmlIntegration');
    const minimalIntegration = document.getElementById('minimalIntegration');

    // Code d'intégration HTML interactif
    htmlIntegration.value = generateIntegrationCode();

    // Version minimaliste
    const designType = document.querySelector('input[name="design"]:checked').value;
    minimalIntegration.value = generateMinimalIntegrationCode(designType);

    // Afficher les champs d'intégration
    document.getElementById('integrationFields').style.display = 'block';
}

function generateMinimalIntegrationCode(designType) {
    const cryptoName = cryptoConfig[selectedCrypto].name;

    const address = document.getElementById('cryptoAddress').value;
    
    if (designType === 'minimal') {
        return `${cryptoName} : ${address}`;
    } else {
        return `<!-- Crypto Donation Box --> 
        <img src="crypto-donation-box/banner-${selectedCrypto}.png" alt="Bannière de don ${cryptoName}" />
		<br \> <br \>
		${cryptoName} : ${address}`;
    }
}


function handleMobileTextClick() {
    const shortAddress = document.getElementById('shortAddress').value;
    const mobileText = document.getElementById('mobile-text');

    navigator.clipboard.writeText(shortAddress)
        .then(() => {
            mobileText.textContent = 'Copiée ! Ouverture....';

            setTimeout(() => {
                mobileText.textContent = 'Cliquez pour copier et ouvrir votre wallet';
                openMoneroWalletOrCakeWallet();
            }, 1500);
        })
        .catch(err => {
            console.error('Erreur lors de la copie :', err);
        });
}

function openMoneroWalletOrCakeWallet() {
    // Tentative d'ouverture de l'application Monero
    const moneroScheme = 'monero://open';
    const cakeWalletUrl = 'https://cakewallet.com';

    // Créer un élément iframe caché
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    // Essayer d'ouvrir l'application Monero
    iframe.src = moneroScheme;

    // Vérifier après un court délai si la page a été quittée
    setTimeout(() => {
        document.body.removeChild(iframe);
        // Si la page est toujours visible, l'application Monero n'a probablement pas été ouverte
        if (document.visibilityState !== 'hidden') {

            window.open(cakeWalletUrl, '_blank');
        }
    }, 500);
}


function setupQRCodeClickToCopy() {
    const qrCode = document.querySelector("#qrcode");
    qrCode.style.cursor = 'pointer';
    qrCode.addEventListener('click', () => {
        const fullAddress = document.getElementById('cryptoAddress').value;
        navigator.clipboard.writeText(fullAddress).then(() => {
            const shortAddressField = document.getElementById('shortAddress');
            shortAddressField.value = "Adresse copiée !";
            setTimeout(() => {
                shortAddressField.value = `${fullAddress.substring(0, 9)}...${fullAddress.substring(fullAddress.length - 7)}`;
            }, 2000);
        });
    });
}


function toggleAddress() {
    const shortAddressElement = document.getElementById('shortAddress');
    const fullAddress = document.getElementById('cryptoAddress').value;
    
    // Copier l'adresse complète dans tous les cas
    navigator.clipboard.writeText(fullAddress).then(() => {
        console.log('Adresse complète copiée dans le presse-papiers');
        
        // Afficher le message de confirmation
        const originalValue = shortAddressElement.value;
        shortAddressElement.value = "- Adresse copiée ! -";
        
        // Après 1 seconde, basculer l'affichage
        setTimeout(() => {
            if (originalValue === fullAddress) {
                // Si l'adresse complète était affichée, passer à la version courte
                shortAddressElement.value = `${fullAddress.substring(0, 9)}...${fullAddress.substring(fullAddress.length - 7)}`;
            } else {
                // Sinon, afficher l'adresse complète
                shortAddressElement.value = fullAddress;
            }
        }, 1000);
    }).catch(err => {
        console.error('Erreur lors de la copie de l"adresse :', err);
        // En cas d'erreur, basculer l'affichage sans le message de confirmation
        if (shortAddressElement.value === fullAddress) {
            shortAddressElement.value = `${fullAddress.substring(0, 9)}...${fullAddress.substring(fullAddress.length - 7)}`;
        } else {
            shortAddressElement.value = fullAddress;
        }
    });
}

function toggleMobileText(show) {
    const mobileText = document.getElementById('mobile-text');
    if (mobileText) {
        if (show) {
            mobileText.classList.remove('hidden');
        } else {
            mobileText.classList.add('hidden');
        }
    }
}

function testCryptoBox(){
	
		// Récupérer le contenu du textarea
		/*var htmlContent = `
		<div style="position: relative; width: 450px; height: 110px; background-image: url('crypto_banner.png'); background-size: cover;">
			<input type="text" value="442oWpEyhXtYFpZtEPEPTjGD7AjjMc8b66Epj6ucVSki4KrBfwRQnUTBwmccvyWskCDFPV8uVeZZe1vuEghn7j93SRaAYfC" readonly style="position: absolute; left: 27%; top: 65px; width: 52%;  padding: 3px; color: white; background-color: #fc8400e8; border: none;">
			<a href="#" style="position: absolute; left: 30%; top: 93px; color: #E9E9E9; font-size:11px; background-color: #df5900; text-decoration: none;">Comment acheter ou envoyer du Monero ?</a>
		</div>
        
        `; */
        var htmlContent = document.getElementById('htmlIntegration').value;
        console.log("HTML integration code : ", htmlContent);

		// Ouvrir un nouvel onglet
		var newWindow = window.open('', '_blank');

		// Injecter le code HTML dans le body du nouvel onglet
        newWindow.document.write(`
            <html><head><title>Affichage du code HTML</title>
            </head><body>
        `);
        newWindow.document.write(htmlContent);
		newWindow.document.write('</body></html>');

		// Fermer l'écriture pour que le contenu s'affiche
		newWindow.document.close();
	
}

// Event listeners
document.querySelectorAll('.crypto-button').forEach(button => {
    button.addEventListener('click', () => updateCryptoSelection(button.dataset.crypto));
});

document.getElementById('cryptoAddress').addEventListener('input', validateAddress);

// Picture detection in integration, desactivates CSS and JS
document.querySelectorAll('input[name="pic-detection"]').forEach(radio => {
    radio.addEventListener('change', function() {
        document.getElementById('htmlIntegration').value = generateIntegrationCode();
    });
});

// Open HTML in new tab
document.getElementById('openHtml').addEventListener('click', testCryptoBox);


// Initialisation
document.getElementById('banner').style.display = 'none';
document.getElementById('saveButton').style.display = 'none';
document.getElementById('cryptoAddress').placeholder = `Adresse ${cryptoConfig[selectedCrypto].name}`;
document.getElementById('addressValidationMessage').textContent = '';
document.getElementById('addressValidationMessage').style.color = 'gray';

document.getElementById('contact-name').addEventListener('input', updateBannerText);
document.getElementById('contact-url').addEventListener('input', updateBannerText);
document.getElementById('contact-email').addEventListener('input', updateBannerText);
// Donation or Merchant payment

document.querySelectorAll('input[name="purpose"]').forEach(radio => {
    radio.addEventListener('change', updateBannerPurpose);
}); 

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    
    toggleMobileText(false);
    
    document.getElementById('exampleAddress').addEventListener('click', fillExampleAddress);
    updateCryptoSelection('monero');  // ou la crypto-monnaie par défaut que vous souhaitez
    // updateBannerPurpose(); // Donation or Merchant payment
    const mobileText = document.getElementById('mobile-text');
    if (mobileText) {
        mobileText.addEventListener('click', handleMobileTextClick);
    }

});
