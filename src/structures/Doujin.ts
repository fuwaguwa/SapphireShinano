import { toTitleCase } from "../lib/Utils";
import { DoujinTags, DoujinTitle } from "../typings/Doujin";

export class Doujin
{
	id: number;
	mediaId: number;

	title: DoujinTitle = {
		english: null,
		japanese: null,
		pretty: null,
	};

	tags: DoujinTags = {
		tags: [],
		artists: [],
		parodies: [],
		characters: [],
		languages: [],
		categories: [],
		groups: [],
	};

	pages: string[] = [];

	uploadTimestamp: number;
	pagesNumber: number;
	favorites: number;

	constructor(doujin)
	{
		this.id = parseInt(doujin.id);
		this.mediaId = parseInt(doujin.media_id);

		this.title.english = doujin.title.english;
		this.title.japanese = doujin.title.japanese;
		this.title.pretty = doujin.title.pretty;

		this.uploadTimestamp = doujin.upload_date;
		this.pagesNumber = doujin.num_pages;
		this.favorites = doujin.num_favorites;

		this.genPagesLink(doujin);
		this.genTags(doujin);
	}

	private genPagesLink(doujin)
	{
		doujin.images.pages.forEach((page, i) =>
		{
			this.pages.push(this.getPageLink(page, i + 1));
		});
	}

	private genTags(doujin)
	{
		doujin.tags.forEach((tag) =>
		{
			const titleTag = toTitleCase(tag.name);

			switch (tag.type)
			{
				case "tag":
					this.tags.tags.push(titleTag);
					break;
				case "artist":
					this.tags.artists.push(titleTag);
					break;
				case "parody":
					this.tags.parodies.push(titleTag);
					break;
				case "character":
					this.tags.characters.push(titleTag);
					break;
				case "language":
					this.tags.languages.push(titleTag);
					break;
				case "category":
					this.tags.categories.push(titleTag);
					break;
				case "group":
					this.tags.groups.push(titleTag);
					break;
			}
		});

		for (const category in this.tags)
		{
			this.tags[category] = this.tags[category].sort();
		}
	}

	private getPageLink(page, pageNum)
	{
		let type = Doujin.getImageType(page.t);
		return `https://i.nhentai.net/galleries/${this.mediaId}/${pageNum}.${type}`;
	}

	private static getImageType(type: string)
	{
		switch (type)
		{
			case "j":
				return "jpg";
			case "p":
				return "png";
			case "g":
				return "gif";
		}
	}
}
