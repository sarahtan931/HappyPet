const express = require('express')
const multer = require('multer');
const bodyParser = require('body-parser');
const sharp = require('sharp');
require('dotenv').config();
const FoodCtrl = require('../controllers/spoonacular-ctrl')
const router = express.Router()
const Barcode = require('aspose-barcode-cloud-node');
const passport = require('passport');
require('../strategy/passport')(passport);
const Joi = require('joi-plus');
const validFood = Joi.string().max(500).min(1).trim().escape();
const validId = Joi.string().max(50).min(0).trim().escape();

const config = new Barcode.Configuration(
    process.env.ASPOSE_CLIENT_ID,
    process.env.ASPOSE_CLIENT_SECRET,
);

router.use(bodyParser.json());

router.get('/foods', FoodCtrl.getFoods)

const SpoonacularCtrl = require('../controllers/spoonacular-ctrl')


router.get('/search/:fooditem', passport.authenticate('jwt', {session: false}), (req, res) => {
    error1 = validFood.validate(req.params.fooditem, { escapeHTML: true });

    if(error1.error != null){
        res.status(400).send('Invalid input');
    } else {
        fooditem = req.params.fooditem
        SpoonacularCtrl.getFoods(req, res, fooditem)
    }
});

router.get('/search/info/products/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    error1 = validId.validate(req.params.id, { escapeHTML: true });

    if(error1.error != null){
        res.status(400).send('Invalid input');
    } else {
        id = req.params.id
        SpoonacularCtrl.getInformationProduct(req, res, id);
    }
})

router.get('/search/info/ingredients/id/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    id = req.params.id
    SpoonacularCtrl.getInformationIngredientId(req, res, id);
})

router.get('/search/info/ingredients/:name', passport.authenticate('jwt', {session: false}), (req, res) => {

    error1 = validFood.validate(req.params.name, { escapeHTML: true });

    if(error1.error != null){
        res.status(400).send('Invalid input');
    } else {
        ingredient = req.params.name
        SpoonacularCtrl.getInformationIngredient(req, res, ingredient);
    }
})

router.get('/search/upc/:upc', passport.authenticate('jwt', {session: false}), (req, res) => {
    error1 = validId.validate(req.params.upc, { escapeHTML: true });

    if(error1.error != null){
        res.status(400).send('Invalid input');
    } else {
        upc = req.params.upc
        SpoonacularCtrl.getUPC(req, res, upc);
    }
})

const api = new Barcode.BarcodeApi(config);

async function recognizeBarcode(api, fileBuffer) {
    const request = new Barcode.PostBarcodeRecognizeFromUrlOrContentRequest();
    request.image = fileBuffer;
    request.type = Barcode.DecodeBarcodeType.All;
    request.preset = Barcode.PresetType.HighPerformance;
    request.fastScanOnly = true;

    const result = await api.postBarcodeRecognizeFromUrlOrContent(request);
    console.log(result);

    return result.body.barcodes;
}

const upload = multer({
    limits: {
        fileSize: 10000000
    },
    fileFilter(req, file, cb) {
        console.log(file);


        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb( new Error('Please upload a valid image file'))
        }
        cb(undefined, true)
    }
})

router.post('/api/barcode', upload.single('photo'), async (req, res) => {
    try {
        const imageFile = req.file.buffer;
        console.log('image retrieved');

        const smallerFile = await sharp(req.file.buffer).resize({
            width: 500,
            height: 500
        }).png().toBuffer();

        let barcodes = await recognizeBarcode(api, smallerFile);

        if (barcodes == null || barcodes.length === 0) {
            // Let's try with the higher resolution image
            barcodes = await recognizeBarcode(api, imageFile);
        }

        if (barcodes != null && barcodes.length === 1) {

            const barcodeResponse = barcodes[0];
            const responseToClient = {
                barcodeValue: barcodeResponse.barcodeValue,
                type: barcodeResponse.type
            }
            res.status(201).send(JSON.stringify(responseToClient));
        } else if (barcodes.length > 1) {
            res.status(400).send(JSON.stringify("More than one barcode found in the image."));
        } else {
            res.status(400).send(JSON.stringify("Could not parse barcode from image"));
        }

    } catch (error) {
        console.log(error)
        res.status(400).send(JSON.stringify(error));
    }
});

module.exports = router
