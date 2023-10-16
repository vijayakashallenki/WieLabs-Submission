import * as fastcsv from 'fast-csv';
import _ from "lodash";
import fs from 'fs';
import { CheerioCrawler} from "crawlee";
import axios from "axios";
import { CheerioAPI, load } from "cheerio";
import { Job, LaunchPost, News, SocialMedia, Startup } from "./types";


// parsing the CSV File:
interface Company {
  'Company Name': string;
  'YC URL': string;
}
export const parseCompanyList = function(csvPath : string) : Promise<Company[]>{
  const companies: Company[] = [];

  // Read the stream from the CSV file code line
  const readStream = fs.createReadStream(csvPath);

  // CSV parsing stream code line
  const csvStream = fastcsv.parse({ headers: true });

  // Piping the read stream to the CSV parsing stream
  readStream
  .pipe(csvStream)
  .on('data', (row: Company) => companies.push(row))
  .on('end', () => {
    console.log('CSV file successfully processed');
    console.log(companies);
  }) 
  return new Promise((resolve, reject) => {
        readStream.on("end", () => {
          resolve(companies);
        });
        readStream.on("error", (error) => {
          reject(error);
        });
      });
}

//Retrieves the name from the provided HTML document.
export const getName = ($: CheerioAPI): string | null =>
  $(".prose.max-w-full h1").text().trim() || null;


 //Retrieves the founding information from the provided HTML document.
export const getFounded = ($: CheerioAPI): string | null => {
  const foundedElement = $(
    'div.flex.flex-row.justify-between span:contains("Founded:") + span'
  );
  const founded = foundedElement.text().trim();

  return founded || null;
};

//Retrieves the team size from the provided HTML document.
export const getTeamSize = ($: CheerioAPI): number | null => {
  const teamSizeElement = $(
    'div.flex.flex-row.justify-between span:contains("Team Size:") + span'
  );
  const teamSize = teamSizeElement.text().trim();

  const parsedTeamSize = parseInt(teamSize, 10);
  return isNaN(parsedTeamSize) ? null : parsedTeamSize;
};


 //Retrieves the company URL from the provided HTML document.

export const getCompanyUrl = ($: CheerioAPI): string | null => {
  const urlElement = $(
    "div.group.flex.flex-row.items-center.px-3.leading-none.text-linkColor a"
  );
  if (urlElement.length > 0) {
    const url = urlElement.attr("href");
    return url ? url : null;
  }
  return null;
};

 //Retrieves the company social media links from the provided HTML document.

export const getCompanySocials = ($: CheerioAPI): SocialMedia => {
  const socials: SocialMedia = {};

  // This is the YC Card that contains the company social media links
  const parentElement = $($(".ycdc-card.space-y-1\\.5.sm\\:w-\\[300px\\] "));

  // Find descendant elements
  parentElement
    .find("> .space-x-2 a.inline-block.w-5.h-5.bg-contain")
    .each(function () {
      const link = $(this).attr("href");
      const platform = $(this).attr("title")?.split(" ")[0].toLowerCase();
      socials[platform as keyof SocialMedia] = link;
    });

  return socials;
};


 //Retrieves the location from the provided HTML document.
export const getLocation = ($: CheerioAPI): string | null =>
  $('div.flex.flex-row.justify-between span:contains("Location:") + span')
    .text()
    .trim() || null;

// Retrieves the number of jobs from the provided HTML document.
export const getNumJobs = ($: CheerioAPI): number | null => {
  const numJobsString = $(`.ycdc-badge.ml-0.font-bold.no-underline`)
    .text()
    .trim();
  // Remove non-numeric characters if any
  const cleanedNumJobsString = numJobsString.replace(/\D/g, "");
  return parseInt(cleanedNumJobsString, 10);
};

// Retrieves the description from the provided HTML document.
export const getDescription = ($: CheerioAPI): string | null =>
  $("p.whitespace-pre-line").text().trim() || null;


//Retrieves the media content from the provided HTML document.
export const getImages = ($: CheerioAPI): string[] => {
  return $("img")
    .map(function () {
      return $(this).attr("src") || "";
    })
    .get();
};


//Retrieves the company logo URL from the provided HTML document.
export const getCompanyLogo = ($: CheerioAPI): string | null =>
  $("div.h-32.w-32.shrink-0.clip-circle-32 img").attr("src") || null;

//Retrieves the company banner URL from the provided HTML document.
export const getBannerUrl = ($: CheerioAPI): string | null =>
  $("div.ycdc-card.space-y-1\\.5.sm\\:w-\\[300px\\] img").attr("src") || null;


//Retrieves the badges from the provided HTML document.
export const getBadges = ($: CheerioAPI): string[] =>
  $(".align-center.flex.flex-row.flex-wrap.gap-y-2.gap-x-2 .ycdc-badge")
    .map(function () {
      const text = $(this).text().trim();
      return text.includes("Y Combinator Logo")
        ? text.split("Y Combinator Logo")[1].trim()
        : text;
    })
    .get();

//Retrieves the short description from the provided HTML document.
export const getShortDescription = ($: CheerioAPI): string | null =>
  $(".prose.hidden.max-w-full.md\\:block .text-xl").text().trim() || null;


//Retrieves the YC batch from the provided HTML document.
export const getBatch = ($: CheerioAPI): string | null => {
  const ycBatchElement = $('.ycdc-badge:contains("Y Combinator Logo")');
  return ycBatchElement.length > 0
    ? ycBatchElement.text().trim().split("Y Combinator Logo")[1].trim()
    : null;
};

 //Scrapes the launch page for a given company and returns the post, votes, createdAt, and sources.
export const scrapeLaunchPage = async (
  url: string
): Promise<Partial<LaunchPost> | null> => {
  // Using Axios and Cheerio here instead of CheerioCrawler to avoid nesting crawlers
  // Playwright would be a nice choice to avoid this and instead click on the "Read Launch" button
  // However, this approach is much faster and easier to implement
  const response = await axios.get(url);
  const $ = load(response.data);
  const baseUrl = getBaseUrl(url);

  // Select the div without a class name within .launch-container
  const bodyContent = $("div.launch-container > div:not([class])");

  // Extract text content and handle img/iframe elements
  const sources: string[] = [];
  const post = bodyContent
    .children()
    .map((_, element) => {
      const childElement = $(element);
      const textContent = childElement.text().trim();

      if (textContent.length > 0) {
        return textContent;
      } else {
        const imgSrc = childElement.find("img").attr("src");
        const iframeSrc = childElement.find("iframe").attr("src");

        if (imgSrc) {
          const src = new URL(imgSrc, baseUrl).href;
          sources.push(src);
          return src;
        } else if (iframeSrc) {
          const src = new URL(iframeSrc, baseUrl).href;
          sources.push(src);
          return src;
        }

        return ""; // No text or src found
      }
    })
    .get()
    .join(" ");

  // Parse votes
  const votesParse = parseInt(
    $(".vote-count-container div:last-child").text().trim(),
    10
  );
  // If votesParse is NaN, set votes to undefined
  const votes = isNaN(votesParse) ? null : votesParse;

  // Get createdAt
  const createdAt = $(".timeago").attr("datetime");

  // Opting to only include unique data that hasn't already been scraped
  return {
    votes: votes ? votes : 0,
    createdAt,
    post,
    sources: [...new Set(sources)],
  };
};

//Retrieves the launch post from the provided HTML document.
export const getAllLaunchPosts = async (
  $: CheerioAPI,
  baseUrl: string
): Promise<(LaunchPost | null)[]> => {
  const launchContainers = $(".company-launch");
  const launchPromises = launchContainers.map(
    async function (): Promise<LaunchPost | null> {
      const launchContainer = $(this);
      const title = launchContainer.find("h3").text().trim();
      const relativeLink = launchContainer
        .find("a:contains('Read Launch')")
        .attr("href");
      const link = relativeLink ? new URL(relativeLink, baseUrl).href : null;
      const description = launchContainer
        .find(".prose.max-w-full.whitespace-pre-line")
        .text()
        .trim();

      if (!title || !description || !link) {
        return null;
      }

      const scrapedLaunchPage = await scrapeLaunchPage(link);
      return { title, link, description, ...scrapedLaunchPage };
    }
  );

  // Use Promise.all() to wait for all promises to resolve
  return await Promise.all(launchPromises);
};


 //Retrieves the news from the provided HTML document.
export const getNews = ($: CheerioAPI): News[] =>
  $("#news div.ycdc-with-link-color")
    .map(function (_) {
      // Using _ to pass along typing to titleElement
      const titleElement = $(this).find("a.prose.font-medium");
      const title = titleElement.text().trim() || null;
      const link = titleElement.attr("href") || null;
      const dateString = $(this).next().text().trim() || null;

      // Convert date string to JavaScript ISO Date string
      const date: string | null = dateString
        ? new Date(dateString).toISOString()
        : null;

      if (!title || !link || !date) return null;
      const news: News = {
        title,
        link,
        date,
      };
      return news;
    })
    .get();

 //Retrieves the jobs from the provided HTML document.

export const getJobs = ($: CheerioAPI): Job[] => {
  const jobs: Job[] = $(".flex.w-full.flex-row.justify-between.py-4")
    .map(function (_) {
      const jobContainer = $(this);
      const role = jobContainer
        .find(".ycdc-with-link-color.pr-4.text-lg.font-bold a")
        .text()
        .trim();
      const location =
        jobContainer
          .find(".justify-left .list-item:first-child")
          .text()
          .trim() || null;
      const salary =
        jobContainer
          .find(".justify-left .list-item:nth-child(2)")
          .text()
          .trim() || null;
      const equity =
        jobContainer
          .find(".justify-left .list-item:nth-child(3)")
          .text()
          .trim() || null;
      const eligibility =
        jobContainer
          .find(".justify-left .list-item:nth-child(4)")
          .text()
          .trim() || null;

      const job: Job = { role, location, salary, equity, eligibility };
      return job;
    })
    .get();

  return jobs;
};

//Retrieves the founders from the provided HTML document.
export const getFounders = ($: CheerioAPI) => {
  // If founder description is available use founderInfo
  const founderInfo = $(
    ".flex.flex-row.flex-col.items-start.gap-3.md\\:flex-row"
  );
  // If founder description is not available, use founder card
  const founderCard = $(".ycdc-card.shrink-0.space-y-1\\.5.sm\\:w-\\[300px\\]");
  if (founderInfo.length > 0) {
    return founderInfo
      .map(function (_) {
        // Founder container is for description
        const founderContainer = $(this);
        // Founder card is for name, imageUrl, and socials
        const founderCard = $(this).find(
          ".ycdc-card.shrink-0.space-y-1\\.5.sm\\:w-\\[300px\\]"
        );
        const name = founderCard.find(".font-bold").text().trim();
        const imageUrl = founderCard.find("img").attr("src");
        // Assuming position is always the second child as it's like that on other YC pages
        const position = founderCard
          .find(".leading-snug")
          .children()
          .eq(1)
          .text()
          .trim();
        const socials: SocialMedia = {};
        founderCard.find("a.h-5.w-5.bg-contain").each(function () {
          const platform = $(this).attr("title")?.split(" ")[0].toLowerCase();
          const link = $(this).attr("href");
          socials[platform as keyof SocialMedia] = link;
        });
        const description: string | null =
          founderContainer.find(".prose.max-w-full").text().trim() || null;
        return {
          name,
          imageUrl,
          position,
          description,
          ...socials,
        };
      })
      .get();
  } else {
    return founderCard
      .map(function (_) {
        const name = $(this).find(".font-bold").text().trim();
        const imageUrl = $(this).find("img").attr("src");
        // Assuming position is always the second child
        const position = $(this)
          .find(".leading-snug")
          .children()
          .eq(1)
          .text()
          .trim();
        const socials: SocialMedia = {};
        $(this)
          .find("a.h-5.w-5.bg-contain")
          .each(function () {
            const platform = $(this).attr("title")?.split(" ")[0].toLowerCase();
            const link = $(this).attr("href");
            socials[platform as keyof SocialMedia] = link;
          });
        return {
          name,
          imageUrl,
          position,
          description: null,
          ...socials,
        };
      })
      .get();
  }
};


//Scrapes the company pages for the provided companies and returns an array of Startup objects.

export const getBaseUrl = (ycUrl: string): string => {
  const url = new URL(ycUrl);
  return `${url.protocol}//${url.host}`;
};


//Scrapes the company pages for the provided companies and returns an array of Startup objects.
export const scrapeCompanyPages = async (
  companies: Company[]
): Promise<Startup[]> => {
  const scrapedData: Startup[] = [];
  const crawler = new CheerioCrawler({
    // $ is the Cheerio object
    async requestHandler({ $, request }: { $: CheerioAPI; request: any }) {
      const ycUrl = request.url;
      const name = getName($);
      const founded = getFounded($);
      const jobs = getJobs($);
      const founders = getFounders($);
      const socialMedia = getCompanySocials($);
      const numJobs = getNumJobs($);
      const teamSize = getTeamSize($);
      const location = getLocation($);
      const description = getDescription($);
      const shortDescription = getShortDescription($);
      const url = getCompanyUrl($);
      const badges = getBadges($);
      const ycBatch = getBatch($);
      const logo = getCompanyLogo($);
      const banner = getBannerUrl($);
      const news = getNews($);
      const launchPosts = await getAllLaunchPosts($, getBaseUrl(ycUrl));
      const images = getImages($);

      scrapedData.push({
        name,
        ycUrl,
        shortDescription,
        description,
        logo,
        banner,
        founded,
        teamSize,
        location,
        url,
        ycBatch,
        badges,
        numJobs,
        jobs,
        founders,
        launchPosts,
        socialMedia,
        news,
        images,
      });
    },
  });
  await crawler.run(companies.map((company: Company) => company["YC URL"]));
  return scrapedData;
};