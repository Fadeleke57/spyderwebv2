FROM node:20-alpine

# set the working directory
WORKDIR /app

# copy the package.json and package-lock.json into the container at /app
COPY package.json package-lock.json ./

# install any needed packages
RUN npm install

# copy the rest of the project files into the container at /app
COPY . .

# build the Next.js project
RUN npm run build

# expose port 3000
EXPOSE 3000

# automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# switch to non-root user
USER nextjs

ENV PORT 3000

# start the Next.js server
CMD ["npm", "start"]