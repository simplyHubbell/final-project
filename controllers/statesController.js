
const States = require('../model/States');
const data = {
    statesData: require('../model/statesData.json'),
    setStates: function (data) { this.statesData = data}
};
const validateState = require('../middleware/validateState');

const getAllStates = async(req, res) => {    
    //retrieve raw data for all states from statesData.json, facts not included
    const rawStates = data.statesData;
    //initialize array for sorted data
    const states = [];
    //check if there is a query
    if (Object.keys(req.query).length !== 0) {
        //check if the query is set to true
        if (req.query.contig === "true") { 
            //filters out Alaska and Hawaii from results and adds filtered data to states array
            states.push(rawStates.filter(
                st => 
                st.code !== "AK" && st.code !== "HI"
            ));
        //check if the query is set to false
        }  else if (req.query.contig === "false") {
            //filters out everything but Alaska and Hawaii from results and adds filtered data to states array
            states.push(rawStates.filter(
                st => 
                st.code === "AK" || st.code === "HI"
            ));
        //catches and refuses all queries that are not 'contig=true' or 'contig=false'
        } else {
            return res.status(400).json({ 'message': 'Invalid query.'})
        }
    }  
    //assigns rawStates data to states array if no previous filtering was needed
    if (states.length === 0) states.push(rawStates);

    //gathers all facts from MongoDB
    const statesFacts = await States.find();

    //checks each state for existing facts, and adds facts to state entry if present
    for (const code in statesFacts) {
        for (const state in states[0]) {
            if (statesFacts[code].stateCode === states[0][state].code) {
                states[0][state].funfacts = statesFacts[code].funfacts;
            };
        };
    }

    //returns all requested states and their related facts
    res.json(states[0]);
}

const addFacts = async (req, res) => {
    //validates state code
    const code = validateState(req?.params?.code);
    if (!code) return res.status(400).json({ 'message': 'Invalid code given'}); 
    
    //ensure data is a non-empty array
    if ((req?.body?.funfacts) && (!Array.isArray(req?.body?.funfacts))) return res.status(400).json({ 'message': 'Data must be formatted within an array' }); 

    //check if state already exists
    const state = await States.findOne({ stateCode: code }).exec();

    //if state does not exist, create it, with any included facts
    if (!state) {
        try {
            const result = await States.create({
                stateCode: code,
                funfacts: req?.body?.funfacts
            });
    
            res.status(201).json(result);
        } catch (err) {
            console.error(err);
        }
    //if state does exist, check if it has existing facts
    } else {
        const stateFacts = state.funfacts;
        //if state has no existing facts, add them
        if (!stateFacts) {        
            if (req.body?.funfacts) state.funfacts = req.body.funfacts;
        //if state has existing facts, append new ones
        } else {  
            if (req.body?.funfacts) state.funfacts = state.funfacts.concat(req.body.funfacts);
        }
    
        //save fact changes
        const result = await state.save();
        res.json(result);    
    }    
}

const updateFact = async (req, res) => {
    //validates state code
    const code = validateState(req?.params?.code);
    if (!code) return res.status(400).json({ 'message': 'Invalid code given'}); 

    //validates index
    if (!req?.body?.index) {
        return res.status(400).json({ 'message': 'Index parameter is required.' });
    }

    //retrieve facts for requested state
    const state = await States.findOne({ stateCode: code }).exec();
    const stateFacts = state.funfacts;

    //adjust index value
    const adjIndex = req.body.index - 1;

    //verifies index has a value
    if (typeof stateFacts[adjIndex] === 'undefined') return res.status(204).json({ 'message': `No fact at index ${req.body.index}.` });

    //replaces current value with provided one
    if (req.body?.funfact) stateFacts[adjIndex] = req.body.funfact;

    //returns updated MongoDB
    const result = await state.save();
    res.json(result);
}

const deleteFact = async (req, res) => {
    //validates state code
    const code = validateState(req?.params?.code);
    if (!code) return res.status(400).json({ 'message': 'Invalid code given'}); 

    //validates index
    if (!req?.body?.index) {
        return res.status(400).json({ 'message': 'Index parameter is required.' });
    }

    //retrieve facts for requested state
    const state = await States.findOne({ stateCode: code }).exec();
    const stateFacts = state.funfacts;

    //adjust index value
    const adjIndex = req.body.index - 1;

    //verifies index has a value
    if (typeof stateFacts[adjIndex] === 'undefined') return res.status(204).json({ 'message': `No fact at index ${req.body.index}.` });

    //removes desired fact
    if (req.body?.funfact) stateFacts.splice(adjIndex, 1);

    //returns updated MongoDB
    const result = await state.save();
    res.json(result);
}

const getState = async (req, res) => { 
    //validates state code
    const code = validateState(req?.params?.code);
    if (!code) return res.status(400).json({ 'message': 'Invalid state abbreviation parameter'});

    //finds requested state
    const state = data.statesData.find(st => st.code === code);

    //retrieves state facts from MongoDB
    const stateFacts = await States.findOne({ stateCode: code }).exec();

    //if state facts are present, adds them to retrieved state object
    if (stateFacts) {
        state.funfacts = stateFacts.funfacts
    }

    //returns requested state
    res.json(state);
}

const funFact = async (req, res) => { 
    //validates state code
    const code = validateState(req?.params?.code);
    if (!code) return res.status(400).json({ 'message': 'Invalid code given'});
    
    //retrieves specified state
    const state = await States.findOne({ stateCode: code }).exec();

    //checks if state has facts/exists in MongoDB
    if (!state) return res.status(204).json({ 'message': 'No fun facts found.' });

    //retrieves facts from state
    const stateFacts = state.funfacts;

    //chooses a random index
    const random = Math.floor(Math.random() * stateFacts.length);

    //sets a random fact
    const stateFact = stateFacts[random];

    //returns a random fact
    res.json(stateFact);
}

const capital = async (req, res) => { 
    //validates state code
    const code = validateState(req?.params?.code);
    if (!code) return res.status(400).json({ 'message': 'Invalid code given'});
    
    const state = data.statesData.find(st => st.code === code);

    capitalObj = {
        "state": state.state,
        "capital": state.capital_city
    }

    res.json(capitalObj);
}

const nickname = async (req, res) => { 
    //validates state code
    const code = validateState(req?.params?.code);
    if (!code) return res.status(400).json({ 'message': 'Invalid code given'});

    const state = data.statesData.find(st => st.code === code);
 
    nickObj = {
        "state": state.state,
        "nickname": state.nickname
    }

    res.json(nickObj);
}

const population = async (req, res) => { 
    //validates state code
    const code = validateState(req?.params?.code);
    if (!code) return res.status(400).json({ 'message': 'Invalid code given'});

    const state = data.statesData.find(st => st.code === code);
    
    popObj = {
        "state": state.state,
        "population": state.population
    }

    res.json(popObj);
}

const admission = async (req, res) => { 
    //validates state code
    const code = validateState(req?.params?.code);
    if (!code) return res.status(400).json({ 'message': 'Invalid code given'});

    const state = data.statesData.find(st => st.code === code );
   
    admissionObj = {
        "state": state.state,
        "admitted": state.admission_date
    }

    res.json(admissionObj);
}

module.exports = {
    getAllStates,
    addFacts,
    updateFact,
    deleteFact,
    getState,
    funFact,
    capital,
    nickname,
    population,
    admission
}