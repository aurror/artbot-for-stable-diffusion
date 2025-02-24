import Head from 'next/head'
import PageTitle from '../components/UI/PageTitle'
import styled from 'styled-components'
import Linker from '../components/UI/Linker'
import FeedbackModal from '../components/Feedback'
import { useState } from 'react'
import { useEffectOnce } from '../hooks/useEffectOnce'
import { trackEvent } from '../api/telemetry'

const Section = styled.div`
  padding-top: 16px;

  &:first-child {
    padding-top: 0;
  }
`

const SubSectionTitle = styled.div`
  font-weight: 700;
  padding-bottom: 8px;
`

const StyledUl = styled.ul`
  margin-left: 8px;
`

const StyledLi = styled.li`
  list-style: square;
  margin-left: 16px;
`

const AddedInfo = styled.div`
  border-left: 2px solid ${(props) => props.theme.text};
  font-size: 14px;
  margin-top: 2px;
  margin-bottom: 8px;
  margin-left: 16px;
  padding-left: 8px;
`

const LinkButton = styled.div`
  display: inline-block;
  cursor: pointer;
  color: ${(props) => props.theme.link};
  font-weight: 600;

  &:hover {
    color: ${(props) => props.theme.linkActive};
  }
`

/** TEMPLATE

<Section>
  <SubSectionTitle>2022.10.27</SubSectionTitle>
  <StyledUl>
    <StyledLi>test</StyledLi>
  </StyledUl>
</Section>

<AddedInfo> exists for further explanation
*/

const Changelog = () => {
  const [showFeedback, setShowFeedback] = useState(false)

  useEffectOnce(() => {
    trackEvent({
      event: 'PAGE_VIEW',
      context: '/pages/changelog'
    })
  })

  return (
    <div className="mb-4">
      {showFeedback && (
        <FeedbackModal handleClose={() => setShowFeedback(false)} />
      )}
      <Head>
        <title>ArtBot - Changelog</title>
      </Head>
      <PageTitle>Changelog</PageTitle>
      <div>
        The latest happenings on ArtBot. Have a feature request or bug report?{' '}
        <LinkButton onClick={() => setShowFeedback(true)}>
          Contact me!
        </LinkButton>
      </div>
      <Section>
        <SubSectionTitle>2022.11.17</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Fix: useAllModels option was broken after the refactor I did
            yesterday. It&apos;s now fixed.
          </StyledLi>
          <StyledLi>
            Fix: Sort by number of available models in model select dropdown on
            the create page.
          </StyledLi>
          <StyledLi>
            Feature: The Horde now supports upscalers like RealESRGAN_x4plus and
            face correction tools such as GFPGAN. These have now been added into
            ArtBot (see both the advanced parameters on the image generation
            page, as well as the advanced options below any image).
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.11.16</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            MILESTONE: 600,000 images have been created with ArtBot!
          </StyledLi>
          <StyledLi>
            Tackling some personal tech debt -- refactored how models are
            fetched and cached from backend API
          </StyledLi>
          <StyledLi>
            Refactored some telemetry tooling for determining which features are
            used, what things break, etc.
          </StyledLi>
          <StyledLi>
            Support for multi-trigger select for available models (currently
            only 1 available). You can mix and match potential triggers to
            change the style of a supported model.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.11.14</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            {' '}
            MILESTONE: 🎉🎉🎉 <strong>500,000</strong> 🎉🎉🎉 images have been
            created with ArtBot!!! The pace has definitely picked up. That is
            awesome to see.
          </StyledLi>
          <StyledLi>
            Replaced document.hasFocus() with{' '}
            <Linker
              href="https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilityState"
              target="_blank"
            >
              document.visibilityState
            </Linker>{' '}
            so that images can still be requested and fetched if ArtBot is
            visible in another tab or monitor. Big thanks to
            &quot;headhunterjack&quot; on Discord.
          </StyledLi>
          <StyledLi>
            Feature: Negative prompt library on the{' '}
            <Linker href="/">create page</Linker>. Rather than having to
            remember to repeatedly paste in a negative prompt, you can now
            optionally save the prompt as load it by default. You can also save
            multiple negative prompts!
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.11.13</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Feature: Preserve input settings when navigating around ArtBot.
            <AddedInfo>
              It&apos;s frustrating to have added all sorts of input for an
              image and then you click some other link on ArtBot to check
              something and then all the data is lost when you return. No more!
              Data is preserved if you move away from the create page. This
              state gets reset when you create a new image.
            </AddedInfo>
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.11.12</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Fix (hopefully): When rerolling existing images or retrying pending
            images, sometimes ArtBot would forget what model you had originally
            selected and revert to the default model (&quot;stable
            diffusion&quot;).
            <StyledLi>
              Fix: Selecting random in the models dropdown never actually
              selected a random model.
            </StyledLi>
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.11.11</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            MILESTONE: That was fast. 400,000 images have been created with
            ArtBot!
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.11.10</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Fix: When using the &quot;use all available models&quot; option, do
            not send a request to &quot;stable_diffusion_inpainting&quot;.
          </StyledLi>
          <StyledLi>
            Added number of currently available models to &quot;use all
            available models&quot; option.{' '}
          </StyledLi>
          <StyledLi>
            Feature: Navigate between multiple pages on{' '}
            <Linker href="/images">images page</Linker> using arrow keys on a
            computer or swiping on a mobile device.
          </StyledLi>
          <StyledLi>
            Fix: Adjusted max steps (down) for various samplers for anonymous
            users -- this contributed to a number of frustrating error messages
            from the Stable Horde API when trying to create images.
          </StyledLi>
          <StyledLi>
            Fix: I think I found the issue with the pesky &quot;90 per 1
            minute&quot; rate limiting error. A number of people open images up
            in new tabs. Each one of those tabs is firing off API calls to
            Stable Horde (especially if you are generating and checking a number
            of image requests). This makes it easy to inadvertently hit a rate
            limit and get unexplained errors. Now, API calls will only happen in
            the active browser tab. Things should be much smoother now. Thanks
            to &quot;webhead&quot; on Discord for helping me to track this down.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.11.09</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            MILESTONE: 300,000 images have been created with ArtBot! (33,000 in
            the last 24 hours)
          </StyledLi>
          <StyledLi>
            Made a number of improvements to pending items page, such as filters
            and options to edit or retry image requests when an error is
            detected from the Stable Horde API.
          </StyledLi>
          <StyledLi>
            Thanks to some refactored logic with the pending items queue,
            I&apos;ve upped limit of images that can be requested at once.
          </StyledLi>
          <StyledLi>
            Fix: issue where clicking &quot;reroll&quot; on an image created
            with the &quot;use all models&quot; options resulted in re-running
            the job again... the whole thing (this meant 20+ new images, when
            you probably only wanted one).
          </StyledLi>
          <StyledLi>
            For those so inclined, I added a{' '}
            <Linker href="https://www.buymeacoffee.com/davely" target="_blank">
              buy me a coffee
            </Linker>{' '}
            link to the <Linker href="/about">about page</Linker>.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.11.08</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Feature: Bulk download images from the{' '}
            <Linker href="/images">images page</Linker>. Hit the select button
            in the top right, pick the images you want and then click the
            download link. A zip file will be created with your images, as well
            as a json file that lists all the relevant image generation details
            (handy if you need to recreate or reference the image details
            later).
          </StyledLi>
          <StyledLi>
            Feature: Generate an image using all models at once! In the advanced
            options panel on the <Linker href="/">create page</Linker>, scroll
            down and select &quot;use all available models&quot;. You will get
            an image back for each model currently available on Stable Horde.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.11.07</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Fix denoising strength not showing up on advanced options panel when
            creating a new img2img request. (Note: due to limitations with the
            Stable Horde API, denoise is only available for img2img and not
            inpainting)
          </StyledLi>
          <StyledLi>
            Updated max steps to 500 for logged in users, providing you have
            enough kudos (add your Stable Horde API key to the settings page to
            log in).
          </StyledLi>
          <StyledLi>Fix: You can now choose random models again.</StyledLi>
          <StyledLi>
            Model descriptions now added below dropdown on advanced options
            panel. If a custom model requires the use of a trigger to activate,
            it is now automatically added to the beginning of your prompt when
            sent to the API.
          </StyledLi>
          <StyledLi>
            Added advanced option to use the karras scheduler, which should help
            improve image generation at lower step counts.
          </StyledLi>
          <StyledLi>
            Feature: You can now use the left and right arrow keys (on desktop),
            or swipe left and right (on mobile) to navigate between related
            images on each image page... providing they exist, of course.
            Additionally, on desktop, if you tap &quot;F&quot;, you can quickly
            favorite or unfavorite an image.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.11.06</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Feature: Mark images as favorites, and filter images on the main
            gallery page (by favorited / non-favorited, image generation type
            and more to come soon).
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.11.05</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Feature: Bulk delete images from the{' '}
            <Linker href="/images">images page</Linker>. Just hit the select /
            checkmark button in the top right to start choosing. I will bring
            this to the image details page in the near future.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.11.04</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            MILESTONE: 200,000 images have been created with ArtBot!
          </StyledLi>
          <StyledLi>
            Add dropdown menu button to{' '}
            <Linker href="/images">images page</Linker> to change sort order of
            images and layout
          </StyledLi>
          <StyledLi>
            Better limits and validation for advanced parameters on the create
            image page, this is especially helpful for logged out or anonymous
            users.
          </StyledLi>
          <StyledLi>
            Make ID of the worker that generated an image visible on image
            details page. This is useful in case you need to report an unsavory
            worker that is running within the cluster. You can report these
            sorts of images on the{' '}
            <Linker
              href="https://discord.com/channels/781145214752129095/1027506429139095562"
              target="_blank"
            >
              Stable Horde Discord channel
            </Linker>
            .
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.11.03</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            FEATURE: Big changes!{' '}
            <Linker href="/?panel=inpainting">Inpainting is now live.</Linker>{' '}
            Upload a photo from a URL, from your device or even use an existing
            image that you&apos;ve created.
          </StyledLi>
          <StyledLi>
            FEATURE: Custom image orientations (you are no longer limited to the
            few aspect ratios I provided for you). Image dimensions must be
            divisible by 64, but I handle that for you after you&apos;ve entered
            your desired dimensions.
          </StyledLi>
          <StyledLi>
            In my endless tinkering, the advanced options panel on the create
            page is now open by default.
          </StyledLi>
          <StyledLi>
            Added some validation to various input fields inside advanced
            options, as well as subtext defining the requiered parameters.
          </StyledLi>
          <StyledLi>
            Temporarily removed painter page while I refactor a few things to
            make it more mobile friendly (and to tie into the existing img2img
            and inpainting system)
          </StyledLi>
          <StyledLi>
            Add ability to sort <Linker href="/images">images page</Linker> by
            newest or oldest images, as well as the ability to jump to the
            beginning or end of your image collection.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.10.30</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Add some debugging logic to attempt to capture some pesky
            &quot;server did not respond to the image request&quot; errors that
            some people are encountering. Pretty sure it&apos;s something on my
            end and not with the Stable Horde cluster.
          </StyledLi>
          <StyledLi>
            Small design change to paint page to make toolbar and overall theme
            more consistent across dark / light mode.
          </StyledLi>
          <StyledLi>
            Fix: Hide inpainting model from models dropdown in non inpainting
            contexts. (e.g., selecting a model from the dropdown menu when doing
            a simple text2img prompt)
          </StyledLi>
          <StyledLi>
            Small feature: Support for uploading images into the{' '}
            <Linker href="/paint">painter page</Linker>
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.10.28</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            NEW FEATURE: 🎨 <Linker href="/paint">Painting!</Linker> You can now
            paint your own images and then send them to the img2img feature.
            <AddedInfo>
              Turn your cheesy drawings into awesome AI generated art. This is
              somewhat in beta as I&apos;m working out some kinks with the
              painting library{' '}
              <Linker href="http://fabricjs.com/" target="_blank">
                (Fabric.js)
              </Linker>
              . This should also lay the groundwork for inpainting support once
              the Stable Horde cluster supports it.
            </AddedInfo>
          </StyledLi>
          <StyledLi>
            Show source image on details page if an image was generated via
            img2img. Also added an upload icon in the top right corner of this
            source image, so you can quickly create / modify a new prompt using
            the original image.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.10.27</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Add light / dark theme options
            <AddedInfo>
              Currently locked to system settings, but I will add an option for
              user preference in the future.
            </AddedInfo>
          </StyledLi>
          <StyledLi>
            Refactored &quot;advanced options panel&quot; on{' '}
            <Linker href="/">main create page</Linker>.
            <AddedInfo>
              The thinking here is to simplify the front page as much as
              possible. If someone has no experience with generative AI art, let
              them quickly create something.
            </AddedInfo>
          </StyledLi>
          <StyledLi>
            Refactored pending item component (background color, text spacing
            issues)
          </StyledLi>
          <StyledLi>
            Fixed: issue when attempting to choose a random sampler.
          </StyledLi>
          <StyledLi>
            Fixed: issue where choosing a model (e.g., stable_diffusion) would
            get saved as a variable for samplers, resulting in payload
            validation errors from the API. This is why testing your code is
            important. Ah hem.
          </StyledLi>
          <StyledLi>
            Track initial estimated wait time returned from API
            <AddedInfo>
              Relates to future feature that will attempt to detect if job has
              gone stale and attempt to retry / resubmit
            </AddedInfo>
          </StyledLi>
          <StyledLi>
            Add new contact form accessible from the{' '}
            <Linker href="/about">about page</Linker>. Questions, comments, or
            bug reports? Send me a message.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.10.24</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            MILESTONE: 100,000 images have been created with ArtBot!
          </StyledLi>
          <StyledLi>
            You can now import images directly from a URL in order to use the
            img2img feature with stable diffusion.
          </StyledLi>
          <StyledLi>
            In the models dropdown list, you can now see the number of workers
            running each model
            <AddedInfo>
              More workers generally means quicker generation times. This is
              helpful if you want to crank through a number of images.
            </AddedInfo>
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.10.20</SubSectionTitle>
        <StyledUl>
          <StyledLi>img2img support is now live for **ALL** users!</StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.10.18</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            PURE CHAOS MODE: Add random option to orientation, sampler and
            models. Try a random selection on one... or all three if you&apos;re
            crazy.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.10.17</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            img2img support is live for trusted users (generally those who are
            contributing back to the Stable Horde with GPU cycles).
          </StyledLi>
          <StyledLi>
            Initial work on getting ArtBot setup as a proper Progressive Web App
            (PWA)
            <AddedInfo>
              Add it to your mobile device homescreen for a more app like
              experience
            </AddedInfo>
          </StyledLi>
          <StyledLi>
            Add simple pagination buttons for{' '}
            <Linker href="/images">images page</Linker> (things were getting
            slow if you had a lot of images stored in the browser cache).
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.10.14</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            MILESTONE: 10,000 images have been created using ArtBot!
          </StyledLi>
          <StyledLi>
            Add option to download PNG of your image
            <AddedInfo>
              Due to bandwidth constraints, the Stable Horde sends images as a
              WEBP file. This isn&apos;t always optimal for downloading to your
              local device. On each image details page, you will see a download
              button (down arrow).
            </AddedInfo>
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.10.11</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            MILESTONE: 1,000 images have been created using ArtBot!
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.10.09</SubSectionTitle>
        <StyledUl>
          <StyledLi>ARTBOT IS OFFICIALLY LAUNCHED! 🎉🎉🎉</StyledLi>
          <StyledLi>
            Quick fix: You can now generate more than 1 image at a time.
          </StyledLi>
        </StyledUl>
      </Section>
    </div>
  )
}

export default Changelog
