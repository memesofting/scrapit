import * as z from 'zod'

const validateInput = (inputObj) =>{
    const Input = z.object({
            title: z.string(),
            description: z.string(),
        })
    
    return Input.safeParse(inputObj)
}

const validateOutput = (outputObj) =>{
    const outputSchema = z.object({
        tite: z.string(),
        description: z.string()
    })

    return outputSchema.safeParse(outputObj)
}

export {validateInput, validateOutput}