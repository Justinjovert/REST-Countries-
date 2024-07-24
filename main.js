

/* DarkMode LightMode */
const themeToggle = document.querySelector('#themeToggle')
let isDarkMode = false
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark')
    isDarkMode = !isDarkMode
})



// Function that sorts the countries
const sortedCountries = (countries) => {
    let countriesArray = []
    for (const country of countries) {
        const localScopedObject = {
            name: country.name.common,
            population: country.population.toLocaleString('en-gb'),
            region: country.region,
            capital: country.capital[0],
            flag: country.flags.png,
            cca3: country.cca3
        }
        countriesArray.push(localScopedObject)
    }
    //Sort countries by name on default
    countriesArray.sort((a, b) => a.name.localeCompare(b.name))
    return countriesArray
}

// Call API
let cachedCountries
const restCountriesAPI = "https://restcountries.com/v3.1/all"
const fetchCountries = async () => {
    // Return if there already exists a cached data
    if (cachedCountries != null || cachedCountries != undefined) {
        return cachedCountries
    }

    try {
        const response = await fetch(restCountriesAPI)
        const data = await response.json()

        const independentCountries = data.filter(country => { return country.independent || country.independent === undefined })
        const sortCountries = sortedCountries(independentCountries)
        cachedCountries = sortCountries
        return sortCountries
    }
    catch (error) {
        return console.error(error)
    }
}

// Search country name as a search parameter for REST Countries API
// And return with values
const fetchCountryData = async (countryName) => {
    try {
        const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`

        const response = await fetch(url)
        const data = await response.json()
        const country = data[0]

        const localScopedObject = {
            nativeName: country.name.nativeName,
            subregion: country.subregion,
            tld: country.tld,
            currency: country.currencies,
            languages: country.languages,
            borders: country.borders,
        }
        return localScopedObject
    }
    catch (error) {
        console.error('404 Not found', error)
    }
}

// Create a country card
const countriesContainer = document.querySelector('.countries-container')
const createCard = (country) => {

    const countryFLAG = document.createElement('IMG')
    countryFLAG.src = `${country.flag}`
    // Convert to string
    const countryFLAGHTML = countryFLAG.outerHTML

    const HMTLstring =
        `<button target="" href="" class="country-card" data-country="${country.name}">
            <div class="country-flag">${countryFLAGHTML}</div>
            <div class="country-card-details">
                <h3>${country.name}</h3>
                <span>Population: ${country.population} </span>
                <span data-region="${country.region}">Region: ${country.region}</span>
                <span data-capital="${country.capital}">Capital: ${country.capital}</span>
            </div>
        </button>`
    countriesContainer.insertAdjacentHTML('beforeend', HMTLstring)

}


// Filter by region dropdown
const dropdownRegion = document.querySelector('.region-select-wrapper')
const dropdownContainer = document.querySelector('#regionselected')
const dropdownOptions = document.querySelector('.region-options-container')
let dropdownOPEN = false
dropdownRegion.addEventListener('click', ({ target }) => {
    if (!dropdownOPEN) {
        dropdownOptions.style.display = "block"
        dropdownOPEN = true
    }
    else {
        dropdownOptions.style.display = "none"
        dropdownOPEN = false
    }

    if (target.tagName === 'BUTTON') {
        dropdownContainer.dataset.region = target.value
        dropdownContainer.textContent = target.value
        filterRegion()
    }
})


document.addEventListener('DOMContentLoaded', () => {
    const results = fetchCountries()
    results.then(data => {
        data.forEach(eachData => {
            createCard(eachData)

        })
    })
})


// Filter by region function
const filterRegion = () => {
    const selectAllCards = document.querySelectorAll('.country-card')
    const region = dropdownContainer.dataset.region
    // If value is world, return all country card
    if (region === 'World') {
        selectAllCards.forEach(card => { card.style.display = 'block' })
        return selectAllCards
    }
    const displayedCards = []
    selectAllCards.forEach(card => {
        if (card.querySelector('[data-region]').dataset.region == region) {
            displayedCards.push(card)
            card.style.display = 'block'
        }
        else {
            card.style.display = 'none'
        }
    })
    return displayedCards
}


// Search country function to what is displayed
// Nondisplayed elements will not be showns
const searchCountries = (filteredCountries) => {
    displayedCards = filterRegion()
    displayedCards.forEach(card => {
        const cardCapital = card.querySelector('[data-capital]')
        if (filteredCountries.includes(card.dataset.country) || filteredCountries.includes(cardCapital.dataset.capital)) {
            card.style.display = 'block'
        }
        else {
            card.style.display = 'none'
        }
    })
}

//Searchbar event listener
const searchBar = document.querySelector('.searchbar')
searchBar.addEventListener('input', async ({ target }) => {
    try {
        let filteredCountries = []
        let input = target.value

        const allCountries = await fetchCountries()
        //Using foreach to push country to array
        allCountries.forEach(country => {
            if (country.name.toLowerCase().includes(input.toLowerCase())) {
                filteredCountries.push(country.name)
            }
            if (country.capital.toLowerCase().includes(input.toLowerCase())) {
                filteredCountries.push(country.capital)
            }
        })
        searchCountries(filteredCountries)
    }
    catch (error) {
        console.error('Error searching countries', error)
    }
})


// Function that formats language to a string
const formatLanguage = (languages) => {
    const languagesObj = languages

    //Format language array to a string
    let string = ''
    let keys = Object.keys(languagesObj)

    //IF conditions for multiple languages
    for (let index = 0; index < keys.length; index++) {
        if (Object.keys(keys).length <= 1) {
            string = languagesObj[keys[index]]
        }
        else if (Object.keys(keys).length == 2) {
            string = languagesObj[keys[index]] + ' and ' + languagesObj[keys[1]]
            break
        }
        else if (Object.keys(keys).length > 2) {
            if (index == Object.keys(keys).length - 1) {
                string += ' and ' + languagesObj[keys[index]]
            }
            else {
                string += languagesObj[keys[index]] + ', '
            }
        }

    }
    return string
}


// Do this
const createCountryDetails = async (data) => {
    const userinputCountry = data
    // Fetch Country
    const result = await fetchCountries()
    let viewCountry
    const borderCountries = []
    result.forEach(country => {
        if (userinputCountry === country.name) {
            viewCountry = country
        }
    })

    // Fetch extra details from country
    const extraDetails = await fetchCountryData(userinputCountry)

    //Create image
    const IMGelement = document.createElement('IMG')
    IMGelement.src = viewCountry.flag

    //Format
    const languageString = formatLanguage(extraDetails.languages)
    const nativeString = Object.keys(extraDetails.nativeName).map(key => extraDetails.nativeName[key].common).join(', ')
    const currenciesString = Object.keys(extraDetails.currency).map(key => extraDetails.currency[key].name)

    // Create border countries elements
    const borderCountriesDiv = document.createElement('DIV')
    borderCountriesDiv.classList.add("border-countries")
    // Format borders
    if (extraDetails.borders !== undefined) {
        result.forEach(country => {
            if (extraDetails.borders.includes(country.cca3)) {
                borderCountries.push(country.name)
            }
        })
        borderCountries.forEach(border => {
            borderCountriesDiv.insertAdjacentHTML('beforeend', `<span data-country-border="${border}">${border}</span>`)
        })
    }
    else {
        borderCountriesDiv.innerHTML = ''
    }

    const HMTLstring = `
            <div class="flag-container">${IMGelement.outerHTML}</div>
            <div class="details-container">
                <h1>${viewCountry.name}</h1>
                <div class="about-country">
                    <div class="details-country">
                        <span><b>Native Name:</b> ${nativeString}</span>
                        <span><b>Population:</b> ${viewCountry.population}</span>
                        <span><b>Region:</b> ${viewCountry.region}</span>
                        <span><b>Sub Region:</b> ${extraDetails.subregion}</span>
                        <span><b>Capital: </b> ${viewCountry.capital}</span>
                    </div>
                    <div class="details-country">
                        <span><b>Top Level Domain:</b> ${extraDetails.tld}</span>
                        <span><b>Currencies:</b> ${currenciesString}</span>
                        <span><b>Languages:</b> ${languageString}</span>
                    </div>
                </div>
                <div class="border-countries-container">
                    <span><b>Border Countries:</b></span>
                    ${borderCountriesDiv.outerHTML}
                </div>
            </div>`



    // HTML CSS style

    // Heading
    // Hide all heading elements except ..
    const heading = document.querySelectorAll('[data-heading]')
    Array.from(heading).forEach(header => {
        if (header.dataset.heading === 'front') {
            header.style.display = 'none'
        }
        else if (header.dataset.heading === 'detail') {
            header.style.display = 'block'
        }
    })


    // Containers
    countriesContainer.style.display = 'none'
    const displayCountry = document.querySelector('.country-detailed-page')
    displayCountry.style.display = 'flex'
    displayCountry.innerHTML = ''
    displayCountry.insertAdjacentHTML('beforeend', HMTLstring)
}

// When a country is interacted, it displays a detailed page of the country
countriesContainer.addEventListener('click', ({ target }) => {
    try {
        if (target.classList.contains("country-card") || target.closest('.country-card')) {
            let country = target.classList.contains("country-card") || target.closest('.country-card')
            console.log(country.dataset.country)
            createCountryDetails(country.dataset.country)
        }
    }
    catch (error) {
        console.error('Error searching countries', error)
    }
})


const backButton = document.querySelector('[data-heading="detail"]')
if (backButton) {
    backButton.addEventListener('click', () => {

        // Hide all heading elements except ..
        const heading = document.querySelectorAll('[data-heading]')
        Array.from(heading).forEach(header => {
            if (header.dataset.heading === 'front') {
                header.style.display = 'flex'
            }
            else if (header.dataset.heading === 'detail') {
                header.style.display = 'none'
            }
        })
        dropdownOptions.style.display = 'none'

        countriesContainer.style.display = 'grid'
        const displayCountry = document.querySelector('.country-detailed-page')
        displayCountry.style.display = 'none'
    })
}


const displayCountry = document.querySelector('.country-detailed-page')
if (displayCountry) {
    displayCountry.addEventListener('click', ({ target }) => {
        let country = target.closest('[data-country-border]').dataset.countryBorder
        createCountryDetails(country)
    })
}