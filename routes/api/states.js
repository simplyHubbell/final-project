const express = require('express');
const router = express.Router();
const statesController = require('../../controllers/statesController');
const { createNewState, updateState } = require('../../controllers/statesController');

router.route('/')
    .get(statesController.getAllStates)

router.route('/:code/funfact')
    .get(statesController.funFact)
    .post(statesController.addFacts) 
    .patch(statesController.updateFact)   
    .delete(statesController.deleteFact)

router.route('/:code')
    .get(statesController.getState)

router.route('/:code/capital')
    .get(statesController.capital)    

 router.route('/:code/nickname')
    .get(statesController.nickname)    

router.route('/:code/population')
    .get(statesController.population)    

router.route('/:code/admission')
    .get(statesController.admission)  

module.exports = router;