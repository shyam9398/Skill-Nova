import re

with open('src/services/dataService.ts', 'r', encoding='utf-8') as f:
    text = f.read()

m_dp = re.search(r'supabase\s*\.\s*from\(\s*["\']discussion_posts["\']\s*\)\s*\.\s*insert\(\{[\s\S]*?\}\)', text)
if m_dp:
    replacement_dp = """supabase
          .from("discussion_posts")
          .insert({
            author_id: authorId,
            title: newPost.title,
            content: newPost.content,
            category: newPost.category,
            tags: newPost.tags,
            likes_count: 0,
            liked_by: [],
          })"""
    text = text[:m_dp.start()] + replacement_dp + text[m_dp.end():]
    print('Fixed discussion_posts insert')
else:
    print('discussion_posts insert NOT found')

m_dr = re.search(r'supabase\s*\.\s*from\(\s*["\']discussion_replies["\']\s*\)\s*\.\s*insert\(\{[\s\S]*?\}\)', text)
if m_dr:
    replacement_dr = """supabase
          .from("discussion_replies")
          .insert({
            post_id: postUid,
            author_id: authorId,
            content: newReply.content,
          })"""
    text = text[:m_dr.start()] + replacement_dr + text[m_dr.end():]
    print('Fixed discussion_replies insert')
else:
    print('discussion_replies insert NOT found')

m_mr = re.search(r'supabase\s*\.\s*from\(\s*["\']mentor_request_replies["\']\s*\)\s*\.\s*insert\(\{[\s\S]*?\}\)', text)
if m_mr:
    replacement_mr = """supabase
          .from("mentor_request_replies")
          .insert({
            request_id: requestUid,
            author_id: authorId,
            content: newReply.content,
          })"""
    text = text[:m_mr.start()] + replacement_mr + text[m_mr.end():]
    print('Fixed mentor_request_replies insert')
else:
    print('mentor_request_replies insert NOT found')

with open('src/services/dataService.ts', 'w', encoding='utf-8') as f:
    f.write(text)

