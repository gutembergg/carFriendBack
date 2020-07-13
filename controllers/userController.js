const express = require('express');

const User = require('../models/user');
const Car = require('../models/car');
const Event = require('../models/event');
const authMiddlewares = require('../middlewares/auth');

const router = express.Router();

router.use(authMiddlewares);

/// User settings ////////////////////////////////////////////////////////////////////////////////////7

router.put('/parametres', async (req, res) => {

    try {
        const { name, contact, email, password } = req.body;
        const id = req.userId;
    
        await User.findByIdAndUpdate(id, { name, contact, email }, 
            (err, result) => {
                if (err) res.send({ success: false, msg: err });
                res.send({ success: true, user: {name, contact, email} });
              }      
            );
        const user = await User.findOne({ email });

        user.password = password;
        await user.save();
        res.send();

    } catch (error) {
        return res.status(400).send({ error: 'Error update user' });
    }
    
});

/// Delete user /////////////////////////////////////////////////////////////////////////////////////////

router.delete('/', async (req, res) => {
    try {
        const userId = req.userId;
        await User.findByIdAndDelete(userId);
        res.send("ok");

    } catch (error) {
        return res.status(400).send({ error: 'Error delete user' });
    }
});


/// Add user car ////////////////////////////////////////////////////////////////////////////////////////

router.post('/cars', async (req, res) => {

    try {
        const id = req.userId;

        const { carName, seats, contact, email, message, address, date, time } = req.body;
    
        const car = await new Car({ carName, seats, contact, email, message, address, date, time });
    
        const user = await User.findById(id);
        await car.save();
        await user.cars.push(car);
        await user.save();
        
        return res.json({ car });
    } catch (error) {
        return res.status(400).send({ error: 'Error create a new car' });
    }
   
});

/// Get user cars /////////////////////////////////////////////////////////////////////////////////////////

router.get('/cars', async (req, res) => {

    try {
        const id = req.userId;

        await User.findById(id)
          .populate('cars')
          .exec((err, user) => {
             console.log("User", user.cars);
             res.json(user.cars);
             })
        } catch (error) {
            return res.status(400).send({ error: 'Error display the cars' });
        }
});

/// Update user cars ///////////////////////////////////////////////////////////////////////////////////

router.put('/car/:id', async (req, res) => {

        try {
            const data = req.body;
            const id = req.params.id;
            const car = await Car.findByIdAndUpdate(id, data,
                 (err, result) => {
                if (err) res.send({ success: false, msg: err });
                res.send({ success: true, car: data });
              }
          );
           
        } catch (error) {
            return res.status(400).send({ error: 'Error update car' });
        }
});

/// delete user cars //////////////////////////////////////////////////////////////////////////////////

router.delete('/car/:id', async (req, res) => {
        try {
            const userId = req.userId;
            const { id } = req.params;
            await Car.findByIdAndDelete(id);
            await User.updateOne(
                { "_id": userId },
                { "$pull": { "cars": id } },
                function (err, reslt){
                    if (err) {
                        throw err
                    } else {
                        res.send("ok");
                    }
                },
            ); 
      
        } catch (error) {
            return res.status(400).send({ error: 'Error delete car' });
        }   
});

/// Insert user passenger in event //////////////////////////////////////////////////////////////// 

router.post('/:id/passengerInEvent', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const event = await Event.findById(id);
        const user = await User.findById(userId);

        await user.passengerInEvent.push(event);
        await user.save();

        return res.send(user);

    } catch (error) {
        return res.status(400).send({ error: 'Register user in event' });
    }
});

/// Get user passenger in event //////////////////////////////////////////////////////////////// 

router.get('/passengerInEvent', async (req, res) => {
    try {
        const userId = req.userId;

        await User.findById(userId)
        .populate('passengerInEvent')
        .exec((err, user) => {
            res.json(user.passengerInEvent);
        })
        
    } catch {
        return res.status(400).send({ error: 'Get user in event' });
    }
});

/// Delete user passenger in event //////////////////////////////////////////////////////////////

router.delete('/:id/passengerInEvent', async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
       
        await User.updateOne(
            { "_id": userId },
            { "$pull": { "passengerInEvent": id } },
            function (err, reslt){
                if (err) {
                    throw err
                } else {
                    res.send("ok");
                }
            },
            //res.send("ok")
        ); 
  

       
    } catch (error) {
        console.log(error)
        return res.status(400).send({ error: 'Error delete user passenger in event' });
    }   
});

/// Insert event user  ///////////////////////////////////////////////////////////////////////////

router.post('/event', async (req, res) => {
    try {
        const userId = req.userId;
        const data = req.body;

        const user = await User.findById(userId);
        const event = await new Event(data);

        await event.save();
        await user.events.push(event);
        await user.save();

        return res.send(event);

    } catch (error) {
        return res.status(400).send({ error: 'Create user event' });
    }
});

/// Get event by user ///////////////////////////////////////////////////////////////////////////

router.get('/event', async (req, res) => {
    try {
        const userId = req.userId;
        await User.findById(userId)
        .populate('events')
        .exec((err, user) => {
            res.json(user.events);
        })

    } catch (error) {
        return res.status(400).send({ error: 'Get user event' });
    }
});

module.exports = app => app.use('/user', router);