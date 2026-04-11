#!/usr/bin/env ruby

require 'optparse'

options = {}

def upsert_adsense_account_meta(content, client)
  replacement = %(  <meta name="google-adsense-account" content="#{client}">\n)

  if content.match?(/<meta name="google-adsense-account" content="[^"]*">\n?/)
    content.gsub(/<meta name="google-adsense-account" content="[^"]*">\n?/, replacement)
  else
    content.sub(/(<meta name="wch-adsense-client" content="[^"]*">\n)/, "\\1#{replacement}")
  end
end

def upsert_adsense_bootstrap(content, client)
  replacement = %(  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=#{client}" crossorigin="anonymous" data-wch-adsense></script>\n)

  if content.match?(/<script async src="https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=[^"]+" crossorigin="anonymous"(?: data-wch-adsense)?><\/script>\n?/)
    content.gsub(
      /<script async src="https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=[^"]+" crossorigin="anonymous"(?: data-wch-adsense)?><\/script>\n?/,
      replacement
    )
  else
    content.sub(/(<link rel="stylesheet" href="[^"]+">\n)/, "#{replacement}\\1")
  end
end

OptionParser.new do |parser|
  parser.banner = 'Usage: ruby scripts/configure-site.rb [options]'

  parser.on('--origin=URL', 'Replace https://example.com with your live origin') do |value|
    options[:origin] = value.sub(%r{/\z}, '')
  end

  parser.on('--analytics-domain=DOMAIN', 'Set the Plausible domain on all HTML pages') do |value|
    options[:analytics_domain] = value
  end

  parser.on('--adsense-client=CLIENT', 'Set the AdSense client ID on all HTML pages') do |value|
    options[:adsense_client] = value
  end

  parser.on('--cookiebot-id=ID', 'Set the Cookiebot ID on all HTML pages and switch consent mode to external') do |value|
    options[:cookiebot_id] = value
  end

  parser.on('--consent-mode=MODE', 'Set consent mode to local or external') do |value|
    options[:consent_mode] = value.to_s.downcase
  end

  parser.on('--google-site-verification=TOKEN', 'Set the Google Search Console verification token') do |value|
    options[:google_site_verification] = value
  end

  parser.on('--bing-site-verification=TOKEN', 'Set the Bing Webmaster verification token') do |value|
    options[:bing_site_verification] = value
  end

  parser.on('--contact-email=EMAIL', 'Replace the public contact email placeholder') do |value|
    options[:contact_email] = value
  end
end.parse!

if options.empty?
  warn 'No options provided. Nothing to update.'
  exit 1
end

root = File.expand_path('..', __dir__)
all_files = Dir.glob(File.join(root, '**', '*')).select { |path| File.file?(path) }
text_files = all_files.select do |path|
  extension = File.extname(path)
  ['.html', '.xml', '.txt'].include?(extension)
end
html_files = text_files.select { |path| File.extname(path) == '.html' }
ads_txt_path = File.join(root, 'ads.txt')
effective_consent_mode = options[:consent_mode]
effective_consent_mode = 'external' if effective_consent_mode.nil? && options[:cookiebot_id]

updated = []

html_files.each do |path|
  original = File.read(path)
  content = original.dup

  if options[:analytics_domain]
    content.gsub!(
      /(<meta name="wch-analytics-domain" content=")[^"]*(")/,
      "\\1#{options[:analytics_domain]}\\2"
    )
  end

  if options[:adsense_client]
    content.gsub!(
      /(<meta name="wch-adsense-client" content=")[^"]*(")/,
      "\\1#{options[:adsense_client]}\\2"
    )

    content = upsert_adsense_account_meta(content, options[:adsense_client])
    content = upsert_adsense_bootstrap(content, options[:adsense_client])
  end

  if options[:cookiebot_id]
    content.gsub!(
      /(<meta name="wch-cookiebot-id" content=")[^"]*(")/,
      "\\1#{options[:cookiebot_id]}\\2"
    )
  end

  if effective_consent_mode
    content.gsub!(
      /(<meta name="wch-consent-mode" content=")[^"]*(")/,
      "\\1#{effective_consent_mode}\\2"
    )
  end

  if options[:google_site_verification]
    content.gsub!(
      /(<meta name="google-site-verification" content=")[^"]*(")/,
      "\\1#{options[:google_site_verification]}\\2"
    )
  end

  if options[:bing_site_verification]
    content.gsub!(
      /(<meta name="msvalidate\.01" content=")[^"]*(")/,
      "\\1#{options[:bing_site_verification]}\\2"
    )
  end

  if options[:contact_email]
    content.gsub!('contact@bottlemath.com', options[:contact_email])
  end

  next if content == original

  File.write(path, content)
  updated << path
end

if options[:origin]
  text_files.each do |path|
    original = File.read(path)
    content = original.gsub('https://example.com', options[:origin])
    next if content == original

    File.write(path, content)
    updated << path unless updated.include?(path)
  end
end

if options[:adsense_client] && File.exist?(ads_txt_path)
  publisher_id = options[:adsense_client].sub(/\Aca-/, '')
  original = File.read(ads_txt_path)
  content = original.gsub('pub-0000000000000000', publisher_id)

  if content != original
    File.write(ads_txt_path, content)
    updated << ads_txt_path unless updated.include?(ads_txt_path)
  end
end

puts(updated.empty? ? 'No files changed.' : updated.map { |path| path.delete_prefix(root + '/') }.join("\n"))
