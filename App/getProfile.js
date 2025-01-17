let btnstrap = document.getElementById('btnstrap')

btnstrap.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true})
    chrome.scripting.executeScript({
        target: { tabId: tab.id},
        function: scrapingProfile,
    })
})

function scrapingProfile() {

    const cssSelectorsProfile = {
        profile: {
            name: 'div.ph5 > div.mt2 > div > ul > li',
            resumen: 'div.ph5 > div.mt2 > div > ul ~ h2',
            // country: 'div.ph5.pb5 > div.display-flex.mt2.pv-top-card--reflow > div.pv-top-card__list-container > ul.cx.mt1 > li'
            country: 'div.ph5 > div.mt2 > div > ul.mt1 > li.t-16',
            email: 'div > section.pv-contact-info__contact-type.ci-email > div > a',
            phone: 'div > section.pv-contact-info__contact-type.ci-phone > ul > li > span',
            urlLinkedin: 'div > section.pv-contact-info__contact-type.ci-vanity-url > div > a'
        },
        experience: {
            positions: '#experience-section > ul' 
        },
        education: {
            schools: '#education-section > ul'
        },
        option: {
            buttonSeeMore: '[data-control-name="contact_see_more"]',
            buttonCloseSeeMore: 'button.artdeco-modal__dismiss',
            //buttonShowMoreExperience: 'pv-profile-section__see-more-inline pv-profile-section__text-truncate-toggle artdeco-button artdeco-button--tertiary artdeco-button--muted'
            buttonShowMoreExperience: '#experience-section > div > button',
            buttonShowMoreEducation: '#education-section > div > button'
        }
    }

    const wait = (milliseconds) => {
        return new Promise(function(resolve){
            setTimeout(function(){
                resolve()
            }, milliseconds);
        })
    }

    const autoscrollToElement = async function(cssSelector){
        const exists = document.querySelector(cssSelector)

        while (exists){
            let maxScrollTop = document.body.clientHeight - window.innerHeight
            let elementScrollTop = document.querySelector(cssSelector).offsetHeight
            let currentScrollTop = window.scrollY

            if (maxScrollTop == currentScrollTop || elementScrollTop <= currentScrollTop)
                break

            await wait(32)

            let newScrollTop = Math.min(currentScrollTop + 20, maxScrollTop)

            window.scrollTo(0, newScrollTop)
        }

        console.log('Finish autoscroll to element %s', cssSelector)

        return new Promise(function(resolve){
            resolve()
        })
    }

    const getContactProfile = async () => {
        const {
            profile: {
                name: nameCss,
                resumen: resumenCss,
                country: countryCss,
                email: emailCss,
                phone: phoneCss,
                urlLinkedin: urlLinkedinCss
            },
            experience: {
                positions: positionsCss
            },
            education: {
                schools: schoolsCss
            },
            option: {
                buttonSeeMore: buttonSeeMoreCss,
                buttonCloseSeeMore: buttonCloseSeeMoreCss,
                buttonShowMoreExperience: buttonShowMoreExperienceCss,
                buttonShowMoreEducation: buttonShowMoreEducationCss
            }
        } = cssSelectorsProfile

        const name = document.querySelector(nameCss)?.innerText
        const resumen = document.querySelector(resumenCss)?.innerText
        const country = document.querySelector(countryCss)?.innerText

        const buttonSeeMore = document.querySelector(buttonSeeMoreCss)
        buttonSeeMore.click()

        await wait(1000)

        const email = document.querySelector(emailCss)?.innerText
        const phone = document.querySelector(phoneCss)?.innerText
        let urlLinkedin = document.querySelector(urlLinkedinCss)?.innerText
        if (urlLinkedin)
            urlLinkedin = `https://${urlLinkedin}`

        const buttonCloseSeeMore = document.querySelector(buttonCloseSeeMoreCss)
        buttonCloseSeeMore.click()

        //Clicking on show more experience in order to get all experiences
        const buttonShowMoreExperience = document.querySelector(buttonShowMoreExperienceCss);
        buttonShowMoreExperience.click();

        wait(1000);

        //Experience
        positionsProfile = [];
        const positions = document.querySelector(positionsCss).children;
        for(i=0; i<positions.length; i++){
            const position = positions[i]?.innerText;
            
            //Splitting position info
            positionInfo_splits = position.split("\n\n");
            //console.log(positionInfo_splits);

            //Splitting dates employed and employment duration
            datesEmployed = positionInfo_splits[3].split("\n")[1];
            employment_duration = positionInfo_splits[3].split("\n")[3];

            positionInfo = {"position":positionInfo_splits[0], "company":positionInfo_splits[2], 
                                "datesEmployed":datesEmployed, "employmenDuration":employment_duration};

            positionsProfile.push(positionInfo);
        }

        //Clicking on show more education in to get all education items
        const buttonShowMoreEducation = document.querySelector(buttonShowMoreEducationCss);
        buttonShowMoreEducation.click();

        wait(1000);

        //Education
        schoolsProfile = [];
        const schools = document.querySelector(schoolsCss).children;
        for(i=0; i<schools.length; i++){
            const school = schools[i]?.innerText;
            schoolInfo_splits = school.split("\n\n");

            schoolName = schoolInfo_splits[0];
            degreeName = schoolInfo_splits[1].split("\n")[1];
            datesAttended = schoolInfo_splits[2].split("\n")[1];

            schoolInfo = {"schoolName":schoolName, "degreeName":degreeName, "datesAttended":datesAttended};

            schoolsProfile.push(schoolInfo);
        }

        return { name, resumen, country, email, phone, urlLinkedin, positionsProfile, schoolsProfile}
    }

    const getProfile = async () => {
        const profile = await getContactProfile()
        await autoscrollToElement('body')
        console.log(profile)
    }

    getProfile()
}