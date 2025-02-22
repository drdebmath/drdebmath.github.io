function convertToLinks(bioData) {
    const { urls, short_bio } = bioData;
    let bioText = short_bio[0];

    for (const [name, url] of Object.entries(urls)) {
        const link = `<a class=\"text-blue-600 dark:text-blue-400 hover:underline\" href=\"${url}\" target=\"_blank\" rel=\"noopener noreferrer\">${name}</a>`;
        bioText = bioText.replace(new RegExp(name, "g"), link);
    }

    return bioText;
}
