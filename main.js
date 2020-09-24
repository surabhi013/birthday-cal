const birthdayJson = fetch("birthdays.json")
    .then(response => response.json())
    .then(result => {
        document.getElementById('birthdays').value = JSON.stringify(result, undefined, 2);
        return result;
    }
);

//show cards for current year by default
const currentYear = new Date().getFullYear();
document.getElementById("input-year").defaultValue = currentYear;
mapBirthdayData(currentYear);

function updateYear() {
    const year = document.getElementById("input-year").value;
    let errorText = '';
    if(year === '') {
        errorText = "Input required";
    } else if (year < 1000 || year > 9999) {
        errorText = "Input must have 4 digits"
    }
    document.getElementById("error").innerHTML = errorText;
    //map data if input is valid
    if(errorText === '') {
        mapBirthdayData(year);
    }
}

async function mapBirthdayData(year) {
    const birthdayData = await birthdayJson;
    //sort array by date
    birthdayData.sort(function(a,b) {
        return new Date(b.birthday) - new Date(a.birthday);
    });
    const mappedData = birthdayData.map(person => {
        const { name, birthday } = person;
        return {
            ...person,
            initials: nameToInitials(name),
            day: computeDay(birthday, year)
        }
    });
    //calculate html based on mapped data
    collateHTML(mappedData);
}

function nameToInitials(fullName) {
    //map name to initials
    const namesArray = fullName.split(' ');
    if (namesArray.length === 1) {
        return `${namesArray[0].charAt(0)}`;
    } else {
        return `${namesArray[0].charAt(0)}${namesArray[namesArray.length - 1].charAt(0)}`
    };
}

function computeDay(birthdate, year) {
    const [month, date] = birthdate.split('/');
    //year should always come from input, not birthdate
    const day = new Date(`${month}-${date}-${year}`).getDay();
    //consider monday to be the first day of the week
    return day === 0 ? 6 : day - 1;
}

function collateHTML(mappedData) {
    const daysOfTheWeek = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
    const calHTML = daysOfTheWeek.map((day, index) => {
        //filter birthday cards for given day
        const cardsForDay = mappedData.filter(d => d.day === index);
        let cardsHtml;
        if(cardsForDay.length === 0) {
            //show grey background for empty box
            cardsHtml = `<div class="card" style="background: lightgrey; width: 150px; line-height: 150px;">
                            &#128528;
                        </div>`;
        } else {
            //form birthday cards
            cardsHtml = mapCardsToHTML(cardsForDay);
        }
        //form full day card
        return `<div class="day-card">
                    <div class="day-indicator">
                        ${day}
                    </div>
                    <div class="birthday-cards">
                        ${cardsHtml}
                    </div>
                </div>`;
    }).join('');
    //render html
    document.getElementById("calendar-panel").innerHTML = calHTML;
}

function mapCardsToHTML(cards) {
    //calculate width based on number of cards
    const width = calculateCardWidth(cards.length);
    return cards.map(card => {
        const randomColorCode = `hsla(${Math.random() * 360}, 70%, 50%, 1)`;
        return `<div class="card" style="background: ${randomColorCode}; width: ${width}px; height: ${width}px; line-height: ${width}px;">
                    ${card.initials}
                    <span class="person-info" style="top: -${width/2}px;">
                        ${card.name}</br>
                        ${card.birthday}
                    </span>
                </div>`;
    }).join('');
}

function calculateCardWidth(n) {
    const cols = Math.ceil(Math.sqrt(n));
    return 150/cols;
}