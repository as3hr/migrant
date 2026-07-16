type AsyncHandler = () => Promise<any>;

const asyncHandler = (fn: AsyncHandler) => {
    return async () => {
        try {
            const result = await fn();
            return result;
        } catch (error) {
            console.error('Error in asyncHandler:', error);
            return {
                success: false,
                message: 'Internal Server Error',
                data: null
            }
        }
    }
}

export default asyncHandler;