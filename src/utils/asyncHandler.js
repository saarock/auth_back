const asyncHandler = (fn) => async (req, res, next) => {
    try {
        return await fn(req, res, next);
    } catch(error) {
        console.log("this are th error: "+ error.message)
        res.status(error.code || 500).json({
            success: false,
            message: error.message || "An error occured"
        })
    }
}
export default asyncHandler