---
title: About
description: "About Song Xue — Ph.D. candidate in Pathogen Biology at Fudan University"
hideTitle: true
toc: false
date: 2025-02-19
cascade:
  type: blog
---

<div style="display: flex; align-items: center; justify-content: center; gap: 6rem; margin-bottom: 2rem;">
  <img src="/images/profile-photo.jpg" alt="Song Xue" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; flex-shrink: 0; margin: 0;" />
  <div>
    <h1 style="margin: 0; font-size: 2rem;">Song Xue</h1>
    <p style="margin: 0.25rem 0 0; opacity: 0.7;">Looking forward to doing cooler things</p>
  </div>
</div>

## About Me

I am currently a Ph.D. candidate in the Department of Pathogen Biology at Fudan University. My primary research interest is the functional properties of viral mutations and their interplay with humoral immunity during infection. In both acute infections (such as SARS-CoV-2) and chronic infections (such as hepatitis B virus), viral replication is often accompanied by random mutations across the viral genome. These mutations resemble a wrong piece accidentally inserted while building with LEGO bricks: in the vast majority of cases, they are detrimental to the virus's survival. Yet low-probability events do occur—a mutation may leave viral replication unaffected while endowing the virus with a greater capacity to survive, for example by escaping antibody neutralization. Meanwhile, our immune system is also engaged in continuous iterative optimization: millions of B cells undergo round after round of selection, with the fittest surviving, until winners emerge that encode antibodies capable of effectively recognizing mutant strains. This is an "arms race" between the pathogen and B cells—and I am clearly rooting for the B cells.

Accordingly, my work focuses on how to identify viral escape mutations more precisely and how to assess the potential biological functions of viral mutations. At the same time, I am even more interested in how to screen for, isolate, and identify antibodies that efficiently neutralize the virus and remain insensitive to escape mutations. My ultimate aspiration is that, once a substantial body of data describing highly potent neutralizing antibodies and the antigens they recognize has accumulated, we can learn from their unique properties to predict and generate the next generation of broadly neutralizing antibodies. In this way, when viruses select escape-capable variants during real-world circulation, we will be able to rapidly develop antibodies that effectively recognize and neutralize those mutant strains. I think that would be truly cool!! Although we remain far from realizing it, I hope to contribute my own part through my past, present, and future efforts.

## About This Blog

The idea of building a blog first occurred to me back in 2024. At that time, I noticed that SARS-CoV-2 antibodies recognizing different epitopes exhibited strikingly different ADE effects in vitro, and that antibodies against the same class of epitopes tended to produce ADE effects of similar magnitude. I therefore set about figuring out how to outline these ADE-positive regions on a structural model in ChimeraX, but the only reference available to me was the User Guide bundled with ChimeraX. At first I assumed that the 'Silhouette' tool mentioned there would accomplish this, yet after many attempts it still fell short of my expectations.

At my wit's end, I searched online and came across an [article](https://www.jameslingford.com/blog/chimerax-outlines/) published by **James Lingford** on his personal website, which solved the problem perfectly. What was even more striking was that he, too, had initially assumed the 'Silhouette' tool was the answer! We had fallen into the same pit; he climbed out, and through that blog post he pulled me out as well. My first thought was: this is so cool! From the bio on his website I learned that he works on protein evolution in Australia, whereas I have always lived and studied in China, trying to understand the relationship between viruses and antibodies. Were it not for that blog post, our paths might never have crossed. That serendipitous encounter felt remarkable, and it gave me the motivation to share the small tricks I have worked out and the pitfalls I have stumbled into: perhaps I, too, can help a newcomer I will never meet.

For now, this site is positioned as a technical blog, where I will share some of my experience with R plotting, the process of building this website, and the use of AI tools. Of course, I am actually more skilled at "wet" lab work, so I will also organize and summarize some of the experimental protocols I use in daily work—both to make them easier for me to keep in order and, I hope, to be of some help to others.

Thank you, James, even though we have never formally spoken.

## How I Use AI Tools

Although I had long wanted to build a website of my own—I worked carefully through Yihui Xie's [tutorial](https://bookdown.org/yihui/blogdown/) on building websites with the blogdown package, and even began writing a [blog based on R Markdown](/blog/ADE_heatmap/ade_heatmap_illustration/)—the learning curve was too steep for me, and increasingly busy work forced me to set it aside for the time being.

But the rocket-like development of AI tools, especially the emergence of agent capabilities, rekindled my enthusiasm in 2026. Need a beautiful HTML page with complex formatting code? No problem—AI can write it. Don't know how to deploy a website? No problem—AI can handle it. I can say with confidence that, without AI's help, I could not have built this blog at this point. I therefore hold a very optimistic and open attitude toward the use of AI tools. At the same time, I believe that: 1. the use of AI tools requires appropriate disclosure; and 2. the author must review AI-generated content and take responsibility for its accuracy. Accordingly, I carefully review every blog post that used AI tools and state clearly at the beginning how they were used, like this:

{{< callout type="error" emoji="🤖" >}}
**AI disclosure**: The outline of this article was determined by the author. AI tools (Claude and DeepSeek) assisted with drafting the initial manuscript and formatting. The author has reviewed all content and takes final responsibility for its accuracy.
{{< /callout >}}

If some of the content here has been helpful to you, I hope you will bear with the somewhat "AI-flavored" prose. Because without its help, these pieces would never have been produced—and there would have been no way for you to see them.

Thank you, Claude; thank you, DeepSeek.

Finally, thank you for your interest. If you would like to get in touch with me for any reason, you can reach me by email: [17301010038@fudan.edu.cn](mailto:17301010038@fudan.edu.cn).
