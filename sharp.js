const sharp = require('sharp');
const path = require('node:path');
const { v4: uuidv4 } = require('uuid');

/**
 * 转换图片格式
 * @param { string } filePath 文件路径
 * @param { string } type 目标格式
 */
async function transform(filePath, type) {
	const output = path.resolve(process.cwd(), `output/${uuidv4()}.${type}`);
	switch (type) {
		case 'png':
			sharp(filePath).png().toFile(output);
			return;
		case 'tiff':
			sharp(filePath).tiff().toFile(output);
			return;
		case 'jpeg':
			sharp(filePath).jpeg().toFile(output);
			return;
		case 'webp':
			sharp(filePath).webp().toFile(output);
			return;
		default:
			return console.error('Unsupported format');
	}
}

exports.transform = transform;
