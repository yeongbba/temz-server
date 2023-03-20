// import httpMocks from 'node-mocks-http';
// import { faker } from '@faker-js/faker';
// import { validate } from '../validator';
// import * as validator from 'express-validator';
// import { setValueToOnlyReadProp } from '../../util/test.util';

// jest.mock('express-validator');

// describe('Validator Middleware', () => {
//   it(`calls 'next' function if there are no validation errors`, () => {
//     const request = httpMocks.createRequest();
//     const response = httpMocks.createResponse();
//     const next = jest.fn();

//     setValueToOnlyReadProp(
//       validator,
//       'validationResult',
//       jest.fn(() => ({
//         isEmpty: () => true,
//       }))
//     );

//     validate(request, response, next);

//     expect(next).toBeCalled();
//   });

//   it(`returns 400 if there are validation errors`, () => {
//     const request = httpMocks.createRequest();
//     const response = httpMocks.createResponse();
//     const next = jest.fn();
//     const errorMsg = faker.random.words(3);

//     setValueToOnlyReadProp(
//       validator,
//       'validationResult',
//       jest.fn(() => ({
//         isEmpty: () => false,
//         array: () => [{ msg: errorMsg }],
//       }))
//     );

//     validate(request, response, next);

//     expect(next).not.toBeCalled();
//     expect(response.statusCode).toBe(400);
//     expect(response._getJSONData().message).toMatch(errorMsg);
//   });
// });
