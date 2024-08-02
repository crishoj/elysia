/**
Fork of fast-querystring

originate
@from https://github.com/anonrig/fast-querystring/tree/main

modified
@from https://discord.com/channels/876711213126520882/1111136889743888455/1263902371801595979

Copyright (c) 2022 Yagiz Nizipli

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
*/

// @ts-ignore
import fastDecode from 'fast-decode-uri-component'

const plusRegex = /\+/g

export function parseQuery(input: string) {
	const result = <Record<string, string>>{}

	if (typeof input !== 'string') return result

	let key = ''
	let value = ''
	let startingIndex = -1
	let equalityIndex = -1
	let flags = 0

	const l = input.length

	for (let i = 0; i < l; i++) {
		switch (input.charCodeAt(i)) {
			case 38: // '&'
				const hasBothKeyValuePair = equalityIndex > startingIndex
				if (!hasBothKeyValuePair) equalityIndex = i

				key = input.slice(startingIndex + 1, equalityIndex)

				if (hasBothKeyValuePair || key.length > 0) {
					if (flags & 0b0000_0001) key = key.replace(plusRegex, ' ')
					if (flags & 0b0000_0010) key = fastDecode(key) || key

					if (!result[key]) {
						if (hasBothKeyValuePair) {
							value = input.slice(equalityIndex + 1, i)

							if (flags & 0b0000_0100)
								value = value.replace(plusRegex, ' ')
							if (flags & 0b0000_1000)
								value = fastDecode(value) || value
						}

						result[key] = value
					}
				}

				key = ''
				value = ''
				startingIndex = i
				equalityIndex = i
				flags = 0
				break

			case 61: // '='
				if (equalityIndex <= startingIndex) equalityIndex = i
				else flags |= 0b0000_1000
				break

			case 43: // '+'
				if (equalityIndex > startingIndex) flags |= 0b0000_0100
				else flags |= 0b0000_0001
				break

			case 37: // '%'
				if (equalityIndex > startingIndex) flags |= 0b0000_1000
				else flags |= 0b0000_0010
				break
		}
	}

	if (startingIndex < l) {
		const hasBothKeyValuePair = equalityIndex > startingIndex
		key = input.slice(
			startingIndex + 1,
			hasBothKeyValuePair ? equalityIndex : l
		)

		if (hasBothKeyValuePair || key.length > 0) {
			if (flags & 0b0000_0001) key = key.replace(plusRegex, ' ')
			if (flags & 0b0000_0010) key = fastDecode(key) || key

			if (!result[key]) {
				if (hasBothKeyValuePair) {
					value = input.slice(equalityIndex + 1, l)

					if (flags & 0b0000_0100)
						value = value.replace(plusRegex, ' ')
					if (flags & 0b0000_1000) value = fastDecode(value) || value
				}

				result[key] = value
			}
		}
	}

	return result
}
