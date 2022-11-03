# Obsidian Page Gallery

Generates a gallery view of selected pages based on images found in them.

> **Warning:** This plugin is in development and should be
> considered unstable! Always make a backup of your vault before testing out a new plugin.

## Prereqs

Depends on [obsidian-dataview](https://github.com/blacksmithgu/obsidian-dataview)
to list pages and page metadata.

## Usage

Create a code block with type `page-gallery`:

```page-gallery
from = '"Images" AND #gallery-image'
fields = ["file.name", "Description"]
```
![Example of the page-gallery plugin in use](./docs/example.png)

*Photos from [Unsplash](https://unsplash.com/)*

## Settings

Options in the `page-gallery` block are parsed using [TOML](https://toml.io/en/).
Valid options are:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
|`from`|`string`|List all pages in the vault.|Query for pages to include in the gallery. Uses the same query syntax as [obsidian-dataview](https://github.com/blacksmithgu/obsidian-dataview).|
|`fields`|`Array<string>`|[]|List of fields to display in the gallery, under the image. Supports both [frontmatter and inline fields](https://blacksmithgu.github.io/obsidian-dataview/data-annotation/).|
|`limit`|`number`|null|Limit on the number of pages that will be displayed in the gallery. Leave this blank to display all of the pages matched by the `from` query.|
|`image`|`object`|See below|Certain CSS properties of gallery images can be controlled using the following options:|
|`image.height`|`string`|`18em`|Display height of each image in the gallery.|
|`image.width`|`string`|`12em`|Display width of each image in the gallery.|
|`image.position`|`string`|`center`|Positioning of each image in the gallery. Try `top`, `center`, or `bottom` (etc) to change what parts of the images are visible.|
|`image.repeat`|`string`|`none`|Whether to repeat (i.e. tile) the image in each gallery item.|
|`image.size`|`string`|`cover`|How the image should be scaled to fit within the gallery tile.|