#!/usr/bin/env ruby

require 'optparse'

options = {}

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
