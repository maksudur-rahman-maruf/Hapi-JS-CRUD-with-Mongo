const Hapi = require('@hapi/hapi');
const Joi = require('joi');
const Mongoose = require("mongoose");
const Schema = Mongoose.Schema;

const server = new Hapi.Server({ "host": "localhost", "port": 3000 });

Mongoose.connect("mongodb://localhost/myhapidb", { useUnifiedTopology: true, useNewUrlParser: true });

const PersonModel = Mongoose.model("person", {
    firstname: String,
    lastname: String
});

// Create a Person
server.route({
    method: "POST",
    path: "/person",
    options: {
        validate: {
            payload: Joi.object({
                firstname: Joi.string().min(3).required(),
                lastname: Joi.string().required()
            }),
            failAction: (request, h, error) => {
                return error.isJoi ? h.response(error.details[0]).takeover() : h.response(error).takeover();
            }
        }
    },
    handler: async (request, h) => {
        try {
            var person = new PersonModel(request.payload);
            var result = await person.save();
            return h.response(result);
        } catch (error) {
            return h.response(error).code(500);
        }
    }

});

// Show the list of People
server.route({
    method: "GET",
    path: "/people",
    handler: async (request, h) => {
        try {
            var person = await PersonModel.find().exec();
            return h.response(person);
        } catch (error) {
            return h.response(error).code(500);

        }
    }
});

// Show single Person
server.route({
    method: "GET",
    path: "/person/{id}",
    handler: async (request, h) => {
        try {
            var person = await PersonModel.findById(request.params.id).exec();
            return h.response(person);
            
        } catch (error) {
            return h.response({
                "statusCode": 500,
                "error": "Internal Server Error!",
                "message": error.message
            }).code(500);
            // return h.response(error).code(500);
        }
    }
});

// Update a Person
server.route({
    method: "PUT",
    path: "/person/{id}",
    options: {
        validate: {
            payload: Joi.object({
                firstname: Joi.string().min(3).required(),
                lastname: Joi.string().required()
            }),
            failAction: (request, h, error) => {
                return error.isJoi ? h.response(error.details[0]).takeover() : h.response(error).takeover();
            }
        }
    },
    handler: async (request, h) => {
        try {
            var result = await PersonModel.findByIdAndUpdate(request.params.id, request.payload, { new: true });
            return h.response(result);
        } catch (error) {
            return h.response(error).code(500);
        }
    }
});

// Delete a Person
server.route({
    method: "DELETE",
    path: "/person/{id}",
    handler: async (request, h) => {
        try {
            var result = await PersonModel.findByIdAndDelete(request.params.id);
            return h.response(result);
        } catch (error) {
            return h.response(error).code(500);
        }
    }
});

server.start();