const data = {
    statesData: require('../model/statesData.json'),
    setStates: function (data) { this.statesData = data}
};

const statesArray = []

const setStatesArray = () => {
    for (const state in data.statesData) {
        statesArray.push(data.statesData[state].code);
    }
}
function validateState (stateCode) {
    
    setStatesArray();

    const state = statesArray.find(st => st === stateCode.toUpperCase())

    if (!state) return
    return state.toUpperCase()
}

module.exports = validateState