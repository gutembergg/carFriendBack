const express = require('express');

const mailer = require('../modules/mailer');
const Event = require('../models/event');
const Car = require('../models/car');
const Passenger = require('../models/passenger');
const mongoose = require('mongoose');

const router = express.Router();

/// Middlewares ////////////////////////////////////////////////////////////////////////////////

const eventMiddleware = async (req, res, next) => {
    try {
        const { id } = req.params;
        const event = await Event.findById(id);
            if(event) {
                return next();
            }            
    } catch (error) {
        return res.status(404).send({ error: 'Error page not found' })
    } 
}



/// New Event /////////////////////////////////////////////////////////////////////////////////////

router.post('/', async (req, res) => {
    try {
        const event = await Event.create(req.body);
 
        let pathname = req.header('origin');
    
         await mailer.sendMail({
            from: '"Caroster" <carosteroctree2020@gmail.com>', 
            to: `${event.email}`, 
            subject: `Votre lien Caroster pour votre événement :${event.title} `,
            html: `
                <p>Bonjour,</p>
                <p>Voici le lien à partager avec les personnes venant à votre événement :</p>
                <p>"<strong>${event.title}</strong>"</p>
                <p>Lien de votre événement : "${pathname}/event/${event._id}"</p>
              ` 
          });

        return res.send(event);

    } catch (error) {
        return  res.status(400).send({ error: 'create event failed' });
    }
});

/// Get a event  /////////////////////////////////////////////////////////////////////////////////////

router.get('/:id', eventMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const event = await Event.findById(id);
        return res.send(event);
    } catch (error) {
        return  res.status(400).send({error: 'error new event'});
    }
   
});

/// Delete event ///////////////////////////////////////////////////////////////////////////////

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Event.findByIdAndDelete(id);
        res.send("OK");
        
    } catch (error) {
        return  res.status(400).send({error: 'error delete event'});
    }
});

/// Add car in event ////////////////////////////////////////////////////////////////////////////

router.post('/:id/cars', async (req, res) => {
    try {
        const data = req.body;
        const { id } = req.params;
        
        const car = await new Car(data);
        const event = await Event.findById(id);
    
        await car.save();
        await event.cars.push(car);
        await event.save();
    
        return res.json({ car });
    } catch (error) {
        return  res.status(400).send('error: create car in event');
    }
});

/// Get cars event /////////////////////////////////////////////////////////////////////////////////

router.get('/:id/cars', eventMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        await Event.findById(id)
            .populate('cars')
            .exec((err, event) => {
                res.json(event.cars);
                console.log(err)
            })

    } catch (error) {
        return  res.status(400).send('error: get car in event');
    }
});

/// Update car //////////////////////////////////////////////////////////////////////////////////////////

router.put('/car/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        await Car.findByIdAndUpdate(id, data, 
            (err, result) => {
                if(err) res.send({ success: false, message: err });
                res.send({ success: true, car: data });
            }
        );

    } catch (error) {
        return  res.status(400).send('error: update car in event');
    }
});

/// delete car //////////////////////////////////////////////////////////////////////////////////////

router.delete('/car/:id', async (req, res) => {
    try {
        const id = req.params.id;
            await Car.findOneAndDelete({_id: id}, (err, result) => {
                if (err) res.send({ success: false, msg: err });
                res.send({ success: true });
            });
            
            await Event.updateMany(
                { "cars": id },
                { "$pull": { "cars": id } },
                function (err, reslt){
                    if (err) throw err;     
                }
            );       
    } catch (error) {
        return  res.status(400).send('error: delete car in event');
    }
});

/// Add passenger in car //////////////////////////////////////////////////////////////////////////////

router.post('/car/:id/passenger', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const car = await Car.findById(id);
        const passenger = await new Passenger(data);

        await passenger.save();
        await car.passengers.push(passenger);
        await car.save();

        const myevent = await Event.findOne(
            { cars: { $eq: car } },
            { title: "string" },
            { "title.$": 1 }
          );
        
        await mailer.sendMail({
            from: '"Caroster" <carosteroctree2020@gmail.com>', 
            to: `${car.email}`, 
            subject: `Nouveau passager - ${passenger.name} `, 
            html: `
                <p>Bonjour,</p>
                <p>Vous avez un nouveau passager dans votre voiture "${car.carName}" pour l'événement "${myevent.title}".</p>
                <p>"<strong>${passenger.name}</strong>"</p>
              ` 
          });

        return res.json({ passenger });

    } catch (error) {
        return  res.status(400).send('error: add passenger in car');
    }
});

/// Get passengers in car /////////////////////////////////////////////////////////////////////////////

router.get('/car/:id/passenger', async (req, res) =>{
    try {
        const { id } = req.params;
        await Car.findById(id)
        .populate('passengers')
        .exec((err, car) => {
            console.log("Cars", err);
            res.json(car.passengers);
            })

    } catch (error) {
        return  res.status(400).send('error: get passenger in car');
    }
});

/// Update passenger in car///////////////////////////////////////////////////////////////////////////

router.put('/car/:id/passenger', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        await Passenger.findByIdAndUpdate(id, data, 
            (err, result) => {
                if(err) res.send({ success: false, message: err });
                res.send({ success: true, passenger: data });
            })
    } catch (error) {
        return  res.status(400).send('error: update passenger in car');
    }
});

/// Insert passenger in event/////////////////////////////////////////////////////////////////////////

router.post('/:id/passenger', async (req, res) => {
    try {
        const data = req.body;
        const { id } = req.params;

        const passenger = await new Passenger(data);
        const event = await Event.findById(id);
        await passenger.save();
        await event.passengers.push(passenger);
        await event.save();

        return res.send(passenger);

    } catch (error) {
        return  res.status(400).send('error: insert passenger in event');
    }
});

/// Get Passengers in event ////////////////////////////////////////////////////////////////////////////

router.get('/:id/passenger', async (req, res) => {
    try {
        const { id } = req.params;
            await Event.findById(id)
                    .populate('passengers')
                    .exec((err, event) => {
                        res.json(event.passengers);
                    })
    } catch (error) {
        return  res.status(400).send('error: get passenger in event');
    }
    
});

/// Delete passenger in car////////////////////////////////////////////////////////////////////////////////////////

router.delete('/passenger/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Passenger.findOneAndDelete({_id: id}, (err, result) => {
            if (err) res.send({ success: false, msg: err });
            res.send({ success: true });
        });
        
        await Car.updateMany(
            { "passengers": id },
            { "$pull": { "passengers": id } },
            function (err, reslt){
                if (err) throw err;     
            }
        ); 
        

    } catch (error) {
        return  res.status(400).send('error: delete passenger in event');
    }
});

/// Delete passenger in waitingList////////////////////////////////////////////////////////////////

router.delete('/passengerInEvent/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Passenger.findOneAndDelete({_id: id}, (err, result) => {
            if (err) res.send({ success: false, msg: err });
            res.send({ success: true });
        });
        
        await Event.updateMany(
            { "passengers": id },
            { "$pull": { "passengers": id } },
            function (err, reslt){
                if (err) throw err;     
            }
        ); 
        
    } catch (error) {
        return  res.status(400).send('error: delete passenger in event');
    }
});

/// Update passenger in waiting List ////////////////////////////////////////////////////////////////

router.put('/passengerInEvent/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        await Passenger.findByIdAndUpdate(id, data, 
            (err, result) => {
                if(err) res.send({ success: false, message: err });
                res.send({ success: true, passenger: data });
            })
    } catch (error) {
        return  res.status(400).send('error: update passenger in waiting List');
    }
});

router.put('/:id/edit', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const event = await Event.findByIdAndUpdate(id, data,
            (err, result) => {
                if(err) res.send({ success: false, message: err });
                res.send({ success: true, event: data });
            })

            let pathname = req.header('origin');
    
            await mailer.sendMail({
               from: '"Caroster" <carosteroctree2020@gmail.com>', 
               to: `${event.email}`,
               subject: `Votre lien Caroster pour votre événement :${event.title} `,
               html: `
                   <p>Bonjour,</p>
                   <p>Voici le lien à partager avec les personnes venant à votre événement :</p>
                   <p>"<strong>${event.title}</strong>"</p>
                   <p>Lien de votre événement : "${pathname}/event/${event._id}"</p>
                 ` 
             });

    } catch (error) {
        return  res.status(400).send('error: delete event');
    }
});


module.exports = app => app.use('/event', router);