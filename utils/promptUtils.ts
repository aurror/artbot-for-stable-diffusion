import { validSampler } from './validationUtils'

interface SavePrompt {
  img2img: boolean
  imageType: string
  copyPrompt: boolean
  prompt: string
  sampler: string
  cfg_scale: number
  orientation: string
  height: number
  width: number
  steps: number
  parentJobId: string
  negative?: string
  source_image?: string
  denoising_strength?: number
  models: Array<string>
}

let initPromptDetails: SavePrompt = {
  img2img: false,
  imageType: '',
  copyPrompt: false,
  prompt: '',
  sampler: 'k_heun',
  cfg_scale: 9.0,
  orientation: '',
  steps: 32,
  height: 512,
  width: 512,
  parentJobId: '',
  negative: '',
  source_image: '',
  denoising_strength: 0.75,
  models: ['stable_diffusion']
}

let promptDetails: SavePrompt = Object.assign({}, initPromptDetails)

// TODO: Restore other parameters relate to image
// e.g., height, width, sampler, etc.
export const savePrompt = ({
  img2img = false,
  imageType = '',
  prompt = '',
  orientation = '',
  sampler = 'k_heun',
  cfg_scale = 9.0,
  steps = 32,
  height = 512,
  width = 512,
  parentJobId = '',
  negative = '',
  source_image = '',
  denoising_strength = 0.75,
  models = ['stable_diffusion']
} = {}) => {
  const samplerValid = validSampler(sampler, img2img)
  promptDetails = {
    img2img,
    imageType,
    copyPrompt: true,
    prompt,
    orientation,
    sampler: samplerValid ? sampler : 'k_euler_a',
    cfg_scale,
    steps,
    height,
    width,
    parentJobId,
    negative,
    source_image,
    denoising_strength,
    models
  }
}

export const loadEditPrompt = () => {
  return Object.assign({}, promptDetails)
}

export const clearPrompt = () => {
  promptDetails = Object.assign({}, initPromptDetails)
}

// Caches prompt so that it can be restored when user switches between tabs
let cachedPrompt = ''

export const updatedCachedPrompt = (text: string) => {
  cachedPrompt = text
}

export const getCachedPrompt = () => {
  return cachedPrompt
}
