import Image from 'next/image'
import OpenAI from "openai"
import { Suspense } from 'react'
import Markdown from 'react-markdown'

export const maxDuration = 300;
const INTRO = "You’re writing a book. It’s a period story about a time in Ben’s late 20s/early 30s. At the beginning he’s new to living alone in his first 1 bdrm apartment. He has a girlfriend and a dog named Bailey. Across the hall he here’s of neighbors roughly his age who host a party every few weeks. He wants to figure out some way to work himself into that entirely foreign friend group. By the end of the novel he’s living happily with his girlfriend and some of their best friends have come out of that once foreign friend group.\n\nWhat are the 12 chapters of the book?"
const INITIAL_MESSAGES: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
  {"role": "system", "content": "You are a helpful writing assistant that only produces content in markdown format."},
  {"role": "user", "content": INTRO},
]
const FOLLOW_UPS = [
  "Write chapter 1",
  "Write chapter 2",
  "Write chapter 3",
  "Write chapter 4",
  "Write chapter 5",
  "Write chapter 6",
  "Write chapter 7",
  "Write chapter 8",
  "Write chapter 9",
  "Write chapter 10",
  "Write chapter 11",
  "Write chapter 12",
]

async function getData(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]) {
  console.log(process.env.OPENAI_API_KEY)
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  
  console.log("CALLING CHATGPT WITH MESSAGES:\n\n", messages)
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages,
  });
  console.log("RECEIVED RESPONSE:\n\n", response)
  // The return value is *not* serialized

  // You can return Date, Map, Set, etc.
 
  return response
}

async function NextMessages({ messages, count }: { count: number, messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] }) {
  const data = await getData([...messages, {"role": "user", "content": FOLLOW_UPS[count]}]);

  const content = data.choices[0].message.content
  return (
    <>
      <Markdown>{content}</Markdown>
      {count < 11 ? (

        <Suspense fallback={<div>loading...</div>}>
        <NextMessages count={count + 1} messages={
          [
            ...messages,
            {"role": "system", "content": content},
            
          ]
        } />
      </Suspense>
        ) : <div/>}
    </>
  )
}

export default async function Home() {
  const data = await getData(INITIAL_MESSAGES)

  const content = data.choices[0].message.content

  console.log(data)
  return (
    <main className="p-24">
      <div className="prose lg:prose-xl">
        <Markdown>{content}</Markdown>
        <Suspense fallback={<div>loading...</div>}>
          <NextMessages count={0} messages={[
            ...INITIAL_MESSAGES,
            {"role": "system", "content": content},
          ]}/>
        </Suspense>
      </div>
    </main>
  )
}
