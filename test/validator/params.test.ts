import { Elysia, t } from '../../src'

import { describe, expect, it } from 'bun:test'
import { req } from '../utils'

describe.each([
	{aot: true},
	{aot: false},
])('Params Validator', (options) => {

	it('parse params without validator', async () => {
		const app = new Elysia(options).get('/id/:id', ({ params: { id } }) => id)
		const res = await app.handle(req('/id/617'))

		expect(await res.text()).toBe('617')
		expect(res.status).toBe(200)
	})

	it('validate single', async () => {
		const app = new Elysia(options).get('/id/:id', ({ params: { id } }) => id, {
			params: t.Object({
				id: t.String()
			})
		})
		const res = await app.handle(req('/id/617'))

		expect(await res.text()).toBe('617')
		expect(res.status).toBe(200)
	})

	it('validate multiple', async () => {
		const app = new Elysia(options).get(
			'/id/:id/name/:name',
			({ params }) => params,
			{
				params: t.Object({
					id: t.String(),
					name: t.String()
				})
			}
		)
		const res = await app.handle(req('/id/617/name/Ga1ahad'))

		expect(await res.json()).toEqual({
			id: '617',
			name: 'Ga1ahad'
		})
		expect(res.status).toBe(200)
	})

	it('parse without reference', async () => {
		const app = new Elysia(options).get('/id/:id', () => '', {
			params: t.Object({
				id: t.String()
			})
		})
		const res = await app.handle(req('/id/617'))

		expect(res.status).toBe(200)
	})

	it('parse single numeric', async () => {
		const app = new Elysia(options).get('/id/:id', ({ params }) => params, {
			params: t.Object({
				id: t.Numeric()
			})
		})
		const res = await app.handle(req('/id/617'))

		expect(await res.json()).toEqual({
			id: 617
		})
		expect(res.status).toBe(200)
	})

	it('parse multiple numeric', async () => {
		const app = new Elysia(options).get(
			'/id/:id/chapter/:chapterId',
			({ params }) => params,
			{
				params: t.Object({
					id: t.Numeric(),
					chapterId: t.Numeric()
				})
			}
		)
		const res = await app.handle(req('/id/617/chapter/12'))

		expect(await res.json()).toEqual({
			id: 617,
			chapterId: 12
		})
		expect(res.status).toBe(200)
	})

	it('create default string params', async () => {
		const app = new Elysia(options).get('/:name', ({ params }) => params, {
			params: t.Object({
				name: t.String(),
				faction: t.String({ default: 'tea_party' })
			})
		})

		const value = await app.handle(req('/nagisa')).then((x) => x.json())

		expect(value).toEqual({
			name: 'nagisa',
			faction: 'tea_party'
		})
	})

	it('create default number params', async () => {
		const app = new Elysia(options).get('/:name', ({ params }) => params, {
			params: t.Object({
				name: t.String(),
				rank: t.Number({ default: 1 })
			})
		})

		const value = await app.handle(req('/nagisa')).then((x) => x.json())

		expect(value).toEqual({
			name: 'nagisa',
			rank: 1
		})
	})

	it('coerce number object to numeric', async () => {
		const app = new Elysia(options).get(
			'/id/:id',
			({ params: { id } }) => typeof id,
			{
				params: t.Object({
					id: t.Number()
				})
			}
		)

		const value = await app.handle(req('/id/1')).then((x) => x.text())

		expect(value).toBe('number')
	})

	it('coerce string object to boolean', async () => {
		const app = new Elysia(options).get(
			'/is-admin/:value',
			({ params: { value } }) => typeof value,
			{
				params: t.Object({
					value: t.Boolean()
				})
			}
		)

		const value = await app
			.handle(req('/is-admin/true'))
			.then((x) => x.text())

		expect(value).toBe('boolean')
	})

	it('create default value on optional params', () => {
		it('parse multiple optional params', async () => {
			const app = new Elysia(options).get(
				'/name/:last?/:first?',
				({ params: { first, last } }) => `${last}/${first}`,
				{
					params: t.Object({
						first: t.String({
							default: 'fubuki'
						}),
						last: t.String({
							default: 'shirakami'
						})
					})
				}
			)

			const res = await Promise.all([
				app.handle(req('/name')).then((x) => x.text()),
				app.handle(req('/name/kurokami')).then((x) => x.text()),
				app.handle(req('/name/kurokami/sucorn')).then((x) => x.text())
			])

			expect(res).toEqual([
				'shirakami/fubuki',
				'kurokami/fubuki',
				'kurokami/sucorn'
			])
		})
	})
})
