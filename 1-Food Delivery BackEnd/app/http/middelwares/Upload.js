const multer = require('multer');
//const uuid = require('uuid').v4;

module.exports = (req, res, next) => {

    //todo: Multer Preparation 
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, "./public/uploads/");
        },
        filename: (req, file, cb) => {
            if(file){
                console.log("upload.js -> Storage: req.file is: ", file);
                const uniquepreffix = Date.now() + '-' + Math.round(Math.random() * 9000)
                cb(null, uniquepreffix + '-' + file.originalname)
            // OR below :
                /* cb(null, `${uuid()}_${file.originalname}`); */
            }else{
                next()
            }
        },
    });

    const fileFilter = (req, file, cb) => {
       if(file){
           console.log("upload.js -> fileFilter : req.file is: ", file);

           if (file.mimetype == "image/jpeg") {
               cb(null, true);
           } else {
               cb("تنها پسوند JPEG پشتیبانی میشود", false);
           }
       }else{
        next();
       }
    };
    /* todo limits
                 is An object specifying the size limits of the following optional properties.
                 Multer passes this object into busboy directly, 
                 and the details of the properties can be found on busboy's page. 
    */

    const upload = multer({
        fileFilter: fileFilter,
        limits: { fileSize: 4000000 }, //4 Mb
        storage: storage,
    }).single("pic");

    upload(req, res, (err) => {
       

           if (err instanceof multer.MulterError) {
               // A Multer error occurred when uploading.
               console.log("Upload.jsx log-> A Multer error occurred when uploading.", err);
               res.status(401).send({ message: "حجم عکس ارسالی بیشتر از 4 مگابایت است" });

           } else if (err) {
               console.log("Upload.js Error -> another error occurred:", err)
               res.status(401).send({ message: err.message || err });
               // An unknown error occurred when uploading.

           } else {

               next()
           }
      

    });




}